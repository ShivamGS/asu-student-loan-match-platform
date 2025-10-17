import json
import os
import requests
from decimal import Decimal
from datetime import datetime
from typing import Dict, Any, Optional, List
import boto3
from botocore.exceptions import ClientError
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Import your authentication helper
from complete_auto_refresh_auth import create_client

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

class Config:
    """Centralized configuration"""
    DEFAULT_EXCHANGE_RATE = 0.012  # INR to USD fallback
    DEFAULT_ANNUAL_RETURN_RATE = 0.06  # 6% retirement fund growth
    DEFAULT_TAX_BRACKET = 0.22  # 22% federal tax bracket
    DEFAULT_SALARY_MATCH_CAP_PERCENTAGE = 6.0  # Default 6% of salary cap
    LLM_TIMEOUT = 120  # seconds
    LLM_TEMPERATURE = 0.3
    MAX_TOKENS = 3000

    # Compound interest multipliers for projection (1 + r)^n at 6% APY
    PROJECTION_10Y = 13.18  # Future value of annuity for 10 years
    PROJECTION_20Y = 36.79  # Future value of annuity for 20 years
    PROJECTION_30Y = 79.06  # Future value of annuity for 30 years

# Global client (cached across Lambda invocations)
llm_client = None
secrets_cache = {}

# DynamoDB resource
dynamodb = boto3.resource('dynamodb')
user_profiles_table = dynamodb.Table(os.environ.get('USER_PROFILES_TABLE', 'asu-user-profiles'))


# ============================================================================
# DYNAMODB OPERATIONS
# ============================================================================

def get_user_profile(asu_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve user profile from DynamoDB
    """
    try:
        response = user_profiles_table.get_item(Key={'asuId': asu_id})
        if 'Item' in response:
            print(f"Found existing profile for ASU ID: {asu_id}")
            return response['Item']
        else:
            print(f"No existing profile found for ASU ID: {asu_id}")
            return None
    except Exception as e:
        print(f"Error retrieving user profile: {str(e)}")
        return None


def convert_floats_to_decimal(obj):
    """
    Recursively convert all float values to Decimal for DynamoDB compatibility
    """
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    else:
        return obj


def save_recommendation_to_profile(
    asu_id: str,
    loan_data: Dict[str, Any],
    salary_data: Dict[str, Any],
    recommendation: Dict[str, Any],
    financial_projections: Dict[str, Any],
    dashboard_data: Dict[str, Any],
    metadata: Dict[str, Any]
) -> None:
    """
    Save or update recommendation in user profile
    """
    try:
        current_time = datetime.utcnow().isoformat()

        # Get existing profile if any
        existing_profile = get_user_profile(asu_id)

        # Extract name from loan application or salary verification
        first_name = ""
        last_name = ""
        full_name = loan_data.get('applicantName') or salary_data.get('employeeName', '')

        if full_name:
            name_parts = full_name.strip().split()
            if len(name_parts) >= 2:
                first_name = name_parts[0]
                last_name = ' '.join(name_parts[1:])
            elif len(name_parts) == 1:
                first_name = name_parts[0]

        # Convert all floats to Decimal for DynamoDB
        recommendation_decimal = convert_floats_to_decimal(recommendation)
        financial_projections_decimal = convert_floats_to_decimal(financial_projections)
        dashboard_data_decimal = convert_floats_to_decimal(dashboard_data)
        metadata_decimal = convert_floats_to_decimal(metadata)
        loan_data_decimal = convert_floats_to_decimal(loan_data)
        salary_data_decimal = convert_floats_to_decimal(salary_data)

        # Prepare recommendation record
        recommendation_record = {
            'timestamp': current_time,
            'recommendation': recommendation_decimal,
            'financialProjections': financial_projections_decimal,
            'dashboardData': dashboard_data_decimal,
            'metadata': metadata_decimal,
            'status': 'Pending'
        }

        if existing_profile:
            # Update existing profile
            print(f"Updating existing profile for ASU ID: {asu_id}")

            # Get existing recommendations or initialize empty list
            existing_recommendations = existing_profile.get('recommendations', [])

            # Add new recommendation to the list
            existing_recommendations.append(recommendation_record)

            # Update the profile
            user_profiles_table.update_item(
                Key={'asuId': asu_id},
                UpdateExpression="""
                    SET 
                    recommendations = :recommendations,
                    latestRecommendation = :latest,
                    loanApplication = :loan,
                    salaryVerification = :salary,
                    debtAmount = :debt,
                    interestRate = :rate,
                    repaymentPeriod = :period,
                    salary = :sal,
                    updatedAt = :updated,
                    #ua = :updated
                """,
                ExpressionAttributeNames={
                    '#ua': 'updated_at'
                },
                ExpressionAttributeValues={
                    ':recommendations': existing_recommendations,
                    ':latest': recommendation_record,
                    ':loan': loan_data_decimal,
                    ':salary': salary_data_decimal,
                    ':debt': str(loan_data.get('loanAmount', 0)),
                    ':rate': Decimal(str(loan_data.get('interestRate', 0))),
                    ':period': str(loan_data.get('loanTenure', 0)),
                    ':sal': Decimal(str(salary_data.get('netSalary', 0))),
                    ':updated': current_time
                }
            )
            print(f"Profile updated successfully for ASU ID: {asu_id}")

        else:
            # Create new profile
            print(f"Creating new profile for ASU ID: {asu_id}")

            new_profile = {
                'asuId': asu_id,
                'asuEmail': f"{asu_id}@asu.edu",
                'firstName': first_name,
                'lastName': last_name,
                'loanApplication': loan_data_decimal,
                'salaryVerification': salary_data_decimal,
                'debtAmount': str(loan_data.get('loanAmount', 0)),
                'interestRate': Decimal(str(loan_data.get('interestRate', 0))),
                'repaymentPeriod': str(loan_data.get('loanTenure', 0)),
                'salary': Decimal(str(salary_data.get('netSalary', 0))),
                'recommendations': [recommendation_record],
                'latestRecommendation': recommendation_record,
                'createdAt': current_time,
                'created_at': current_time,
                'updatedAt': current_time
            }

            user_profiles_table.put_item(Item=new_profile)
            print(f"New profile created successfully for ASU ID: {asu_id}")

    except Exception as e:
        print(f"Error saving recommendation to profile: {str(e)}")
        import traceback
        traceback.print_exc()
        # Don't raise - we don't want to fail the whole Lambda if DB save fails
        # The response is already generated and will be returned


# ============================================================================
# AWS SECRETS MANAGER
# ============================================================================

def get_secret(secret_name: str) -> Dict[str, Any]:
    """
    Retrieve secrets from AWS Secrets Manager with caching
    """
    if secret_name in secrets_cache:
        return secrets_cache[secret_name]

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=os.environ.get('AWS_REGION', 'us-east-1')
    )

    try:
        response = client.get_secret_value(SecretId=secret_name)
        secret = json.loads(response['SecretString'])
        secrets_cache[secret_name] = secret
        return secret
    except ClientError as e:
        print(f"Error retrieving secret {secret_name}: {str(e)}")
        raise


def get_cognito_credentials() -> Dict[str, str]:
    """
    Get Cognito credentials from environment variables
    """
    return {
        'username': os.environ['COGNITO_USERNAME'],
        'password': os.environ['COGNITO_PASSWORD'],
        'bearer_token': os.environ['BEARER_TOKEN']
    }


# ============================================================================
# HTTP SESSION WITH RETRY LOGIC
# ============================================================================

def create_http_session() -> requests.Session:
    """
    Create HTTP session with automatic retry logic
    """
    session = requests.Session()

    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"]
    )

    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    return session


# ============================================================================
# LLM CLIENT INITIALIZATION
# ============================================================================

def initialize_llm_client():
    """
    Initialize LLM client with Cognito authentication (cached across invocations)
    """
    global llm_client

    if llm_client is None:
        credentials = get_cognito_credentials()
        llm_client = create_client(
            username=credentials['username'],
            password=credentials['password'],
            bearer_token=credentials['bearer_token']
        )
        print("LLM client initialized successfully")
    else:
        # Ensure token is still valid
        try:
            llm_client.cognito_auth.ensure_valid_token()
        except Exception as e:
            print(f"Token refresh failed, reinitializing client: {str(e)}")
            llm_client = None
            return initialize_llm_client()

    return llm_client


# ============================================================================
# INPUT VALIDATION
# ============================================================================

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


def validate_input(event: Dict[str, Any]) -> None:
    """
    Validate input event structure and values
    """
    # Check required fields
    if 'asuId' not in event or not event['asuId']:
        raise ValidationError("Missing required field: asuId")

    if 'loanApplication' not in event:
        raise ValidationError("Missing required field: loanApplication")

    if 'salaryVerification' not in event:
        raise ValidationError("Missing required field: salaryVerification")

    # Validate loan data
    loan_data = event['loanApplication']
    required_loan_fields = ['loanAmount', 'interestRate', 'loanTenure']

    for field in required_loan_fields:
        if field not in loan_data:
            raise ValidationError(f"Missing loan field: {field}")

        value = float(loan_data[field])
        if value < 0:
            raise ValidationError(f"Invalid {field}: must be non-negative")

    if float(loan_data['interestRate']) > 100:
        raise ValidationError("Interest rate must be <= 100%")

    # Validate salary data
    salary_data = event['salaryVerification']
    required_salary_fields = ['netSalary', 'grossSalary']

    for field in required_salary_fields:
        if field not in salary_data:
            raise ValidationError(f"Missing salary field: {field}")

        value = float(salary_data[field])
        if value <= 0:
            raise ValidationError(f"Invalid {field}: must be positive")

    # Ensure salary currency is USD
    salary_currency = salary_data.get('currency', 'USD')
    if salary_currency != 'USD':
        raise ValidationError(f"Salary must be in USD. Received currency: {salary_currency}. Please convert salary to USD before submitting.")

    # Validate employer policy if provided
    if 'employerMatchPolicy' in event:
        policy = event['employerMatchPolicy']

        if 'maxMonthlyMatchCap' in policy and float(policy['maxMonthlyMatchCap']) <= 0:
            raise ValidationError("maxMonthlyMatchCap must be positive")

        if 'maxAnnualMatchCap' in policy and float(policy['maxAnnualMatchCap']) <= 0:
            raise ValidationError("maxAnnualMatchCap must be positive")

        # Validate salary percentage cap
        if 'maxSalaryPercentageCap' in policy:
            salary_cap = float(policy['maxSalaryPercentageCap'])
            if salary_cap <= 0 or salary_cap > 100:
                raise ValidationError("maxSalaryPercentageCap must be between 0 and 100")


# ============================================================================
# EXCHANGE RATE SERVICE
# ============================================================================

def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    """
    Get current exchange rate from external API with fallback
    """
    if from_currency == to_currency:
        return 1.0

    # Check environment for custom exchange rate
    env_rate_key = f'EXCHANGE_RATE_{from_currency}_TO_{to_currency}'
    if env_rate_key in os.environ:
        return float(os.environ[env_rate_key])

    try:
        # Try to get live rate
        api_key = os.environ.get('EXCHANGE_RATE_API_KEY')

        if api_key:
            url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency}/{to_currency}"
            response = requests.get(url, timeout=5)

            if response.status_code == 200:
                data = response.json()
                if data.get('result') == 'success':
                    rate = data['conversion_rate']
                    print(f"Live exchange rate {from_currency} to {to_currency}: {rate}")
                    return rate

    except Exception as e:
        print(f"Exchange rate API error: {str(e)}, using fallback rate")

    # Fallback to default
    print(f"Using default exchange rate: {Config.DEFAULT_EXCHANGE_RATE}")
    return Config.DEFAULT_EXCHANGE_RATE


# ============================================================================
# FINANCIAL CALCULATIONS
# ============================================================================

def calculate_monthly_emi(principal: float, annual_rate: float, years: int) -> float:
    """
    Calculate monthly EMI (Equated Monthly Installment) using standard loan formula
    """
    if principal <= 0 or years <= 0:
        return 0.0

    monthly_rate = (annual_rate / 100) / 12
    num_payments = years * 12

    # Handle zero interest rate case
    if monthly_rate == 0:
        return round(principal / num_payments, 2)

    # Standard EMI formula
    emi = (principal * monthly_rate * (1 + monthly_rate) ** num_payments) / \
          ((1 + monthly_rate) ** num_payments - 1)

    return round(emi, 2)


def calculate_debt_to_income_ratio(monthly_debt: float, monthly_income: float) -> float:
    """
    Calculate debt-to-income ratio as percentage
    """
    if monthly_income <= 0:
        return 0.0

    return round((monthly_debt / monthly_income) * 100, 2)


# ============================================================================
# LLM INPUT PREPARATION
# ============================================================================

def prepare_llm_input(
    loan_data: Dict[str, Any],
    salary_data: Dict[str, Any],
    employer_policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Prepare structured input for LLM financial advisor
    ALL CALCULATIONS IN USD - converts loan from INR if needed
    """
    # Target currency is always USD for all calculations
    TARGET_CURRENCY = 'USD'

    # Get currencies
    loan_currency = loan_data.get('currency', 'INR')
    salary_currency = salary_data.get('currency', 'USD')

    # Ensure salary is in USD
    if salary_currency != TARGET_CURRENCY:
        raise ValidationError(f"Salary must be in USD. Received: {salary_currency}")

    # Convert loan amount to USD if needed
    loan_amount_original = float(loan_data.get('loanAmount', 0))

    if loan_currency == TARGET_CURRENCY:
        # Already in USD
        loan_amount_usd = loan_amount_original
        exchange_rate = 1.0
        print(f"Loan already in USD: ${loan_amount_usd:,.2f}")
    else:
        # Convert to USD (e.g., INR to USD)
        exchange_rate = get_exchange_rate(loan_currency, TARGET_CURRENCY)
        loan_amount_usd = loan_amount_original * exchange_rate
        print(f"Converted {loan_currency} {loan_amount_original:,.2f} to USD ${loan_amount_usd:,.2f} (rate: {exchange_rate})")

    # Calculate monthly EMI in USD
    monthly_emi_usd = calculate_monthly_emi(
        loan_amount_usd,
        float(loan_data.get('interestRate', 0)),
        int(loan_data.get('loanTenure', 0))
    )

    # Get monthly salary in USD
    monthly_salary_usd = float(salary_data.get('netSalary', 0))
    annual_salary_usd = monthly_salary_usd * 12

    # Get salary percentage cap from policy
    max_salary_percentage = float(employer_policy.get('maxSalaryPercentageCap', Config.DEFAULT_SALARY_MATCH_CAP_PERCENTAGE))

    # Calculate salary-based limits
    max_annual_based_on_salary = annual_salary_usd * (max_salary_percentage / 100)
    max_monthly_based_on_salary = max_annual_based_on_salary / 12

    # Calculate debt-to-income ratio
    dti_ratio = calculate_debt_to_income_ratio(monthly_emi_usd, monthly_salary_usd)

    print(f"Financial Summary (USD):")
    print(f"  - Annual Salary: ${annual_salary_usd:,.2f}")
    print(f"  - Monthly Salary: ${monthly_salary_usd:,.2f}")
    print(f"  - Monthly EMI: ${monthly_emi_usd:,.2f}")
    print(f"  - DTI Ratio: {dti_ratio:.2f}%")
    print(f"  - Salary Cap: {max_salary_percentage}% = ${max_monthly_based_on_salary:,.2f}/month (${max_annual_based_on_salary:,.2f}/year)")

    input_summary = {
        "employeeFinancials": {
            "monthlySalary": round(monthly_salary_usd, 2),
            "annualSalary": round(annual_salary_usd, 2),
            "currency": TARGET_CURRENCY,
            "employer": salary_data.get('employerName', 'Arizona State University'),
            "deductions": round(float(salary_data.get('deductions', 0)), 2),
            "grossSalary": round(float(salary_data.get('grossSalary', 0)), 2)
        },
        "studentLoan": {
            "totalAmountUSD": round(loan_amount_usd, 2),
            "originalCurrency": loan_currency,
            "originalAmount": round(loan_amount_original, 2),
            "exchangeRate": round(exchange_rate, 4) if loan_currency != TARGET_CURRENCY else None,
            "conversionNote": f"Converted from {loan_currency}" if loan_currency != TARGET_CURRENCY else "Already in USD",
            "provider": loan_data.get('loanProvider', 'N/A'),
            "interestRate": round(float(loan_data.get('interestRate', 0)), 2),
            "tenureYears": int(loan_data.get('loanTenure', 0)),
            "estimatedMonthlyPaymentUSD": round(monthly_emi_usd, 2),
            "loanType": loan_data.get('loanType', 'UNSECURED')
        },
        "debtToIncomeRatio": dti_ratio,
        "employerMatchPolicy": {
            **employer_policy,
            "maxSalaryPercentageCap": max_salary_percentage,
            "maxMonthlyBasedOnSalary": round(max_monthly_based_on_salary, 2),
            "maxAnnualBasedOnSalary": round(max_annual_based_on_salary, 2),
            "effectiveMonthlyLimit": round(min(
                float(employer_policy.get('maxMonthlyMatchCap', 500)),
                max_monthly_based_on_salary
            ), 2),
            "effectiveAnnualLimit": round(min(
                float(employer_policy.get('maxAnnualMatchCap', 5500)),
                max_annual_based_on_salary
            ), 2)
        },
        "calculationCurrency": TARGET_CURRENCY,
        "note": "All financial calculations are performed in USD with salary-based cap applied"
    }

    return input_summary


# ============================================================================
# LLM API INTERACTION
# ============================================================================

def call_llm_api_with_cognito_auth(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call LLM API with Cognito authentication and retry logic
    """
    # Initialize and get authenticated client
    client = initialize_llm_client()
    client.cognito_auth.ensure_valid_token()
    cognito_jwt_token = client.cognito_auth.get_access_key()

    print("Cognito JWT token obtained successfully")

    # System prompt for financial advisor role
    system_prompt = """You are an expert financial advisor specializing in student loan repayment and retirement planning under SECURE 2.0 Act provisions.

Your task is to analyze an employee's financial situation and recommend the optimal employer retirement contribution match for their student loan payments.

INPUTS YOU WILL RECEIVE:
- Monthly salary (net take-home in USD)
- Annual salary (in USD)
- Student loan details (amount in USD, interest rate, monthly payment)
- Debt-to-income ratio
- Employer match policy with THREE caps:
  1. maxMonthlyMatchCap (e.g., $500/month)
  2. maxAnnualMatchCap (e.g., $5,500/year)
  3. maxSalaryPercentageCap (typically 6% of annual salary)
  
CRITICAL: The match amount MUST NOT exceed the LOWEST of these three limits:
- Monthly policy cap
- Annual policy cap / 12
- Salary percentage cap (e.g., 6% of annual salary / 12)

OUTPUT REQUIRED (MUST BE VALID JSON):
{
  "recommendedMatchPercentage": <50, 75, or 100>,
  "recommendedMonthlyMatchAmount": <dollar amount - respecting ALL caps>,
  "recommendedAnnualMatchAmount": <dollar amount - respecting ALL caps>,
  "rationale": "<detailed explanation including which cap was limiting factor>",
  "riskAssessment": "<low/medium/high>",
  "capApplied": "<which cap limited the match: 'monthly_policy', 'annual_policy', 'salary_percentage', or 'none'>",
  "alternativeOptions": [
    {
      "matchPercentage": <number>,
      "monthlyAmount": <number>,
      "annualAmount": <number>,
      "pros": "<benefits>",
      "cons": "<drawbacks>"
    }
  ],
  "financialHealthScore": <0-100>,
  "recommendations": [
    "<specific actionable advice 1>",
    "<specific actionable advice 2>",
    "<specific actionable advice 3>"
  ],
  "taxBenefits": "<explanation of tax advantages>",
  "projectedOutcomes": {
    "5years": "<projected benefit after 5 years>",
    "10years": "<projected benefit after 10 years>",
    "atLoanPayoff": "<projected benefit when loan is paid off>"
  }
}

DECISION CRITERIA:
1. Debt-to-income ratio < 15% = Low risk → recommend 100% match
2. Debt-to-income ratio 15-25% = Medium risk → recommend 75% match
3. Debt-to-income ratio > 25% = High risk → recommend 50-75% match
4. ALWAYS apply the most restrictive cap (monthly cap, annual cap, OR salary percentage cap)
5. Balance loan repayment with retirement savings growth
6. Account for compound interest on retirement savings
7. Consider tax advantages of retirement contributions

CRITICAL: Respond ONLY with valid JSON. No markdown formatting, no code blocks, no explanations outside JSON structure."""

    user_prompt = f"""Analyze this employee's financial situation and recommend the optimal retirement match:

{json.dumps(input_data, indent=2)}

IMPORTANT: The employer has a {input_data['employerMatchPolicy']['maxSalaryPercentageCap']}% of salary cap.
This means max ${input_data['employerMatchPolicy']['maxMonthlyBasedOnSalary']}/month based on salary.

Ensure your recommendation does NOT exceed this limit, even if the policy caps are higher.

Provide your recommendation in the exact JSON format specified in the system prompt. Be specific and use the actual numbers provided."""

    # API request payload
    payload = {
        "model": os.environ.get('LLM_MODEL', 'Anthropic Claude-V3.5 Sonnet Vertex AI (Internal)'),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": Config.LLM_TEMPERATURE,
        "max_tokens": Config.MAX_TOKENS,
        "stream": False
    }

    # Headers with Cognito JWT authentication
    headers = {
        'x-api-key': f'Bearer {os.environ["BEARER_TOKEN"]}',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {cognito_jwt_token}'
    }

    llm_api_url = os.environ.get(
        'LLM_API_URL',
        'https://api-llm.ctl-gait.clientlabsaft.com/chat/completions'
    )

    print(f"Calling LLM API: {llm_api_url}")

    # Use session with retry logic
    session = create_http_session()

    try:
        response = session.post(
            llm_api_url,
            json=payload,
            headers=headers,
            timeout=Config.LLM_TIMEOUT
        )

        if response.status_code != 200:
            error_msg = f"LLM API Error: {response.status_code} - {response.text}"
            print(error_msg)
            raise Exception(error_msg)

        print("LLM API call successful")
        return response.json()

    finally:
        session.close()


# ============================================================================
# LLM RESPONSE PARSING
# ============================================================================

def clean_llm_content(content: str) -> str:
    """
    Clean markdown formatting from LLM response
    """
    content = content.strip()

    # Remove markdown code blocks
    if content.startswith('```json'):
        content = content[7:]  # Remove '```json'
    elif content.startswith('```'):
        content = content[3:]  # Remove '```'

    if content.endswith('```'):
        content = content[:-3]  # Remove trailing '```'

    return content.strip()


def validate_recommendation(recommendation: Dict[str, Any]) -> None:
    """
    Validate that recommendation contains all required fields
    """
    required_fields = [
        'recommendedMatchPercentage',
        'recommendedMonthlyMatchAmount',
        'recommendedAnnualMatchAmount',
        'rationale',
        'riskAssessment'
    ]

    missing_fields = [field for field in required_fields if field not in recommendation]

    if missing_fields:
        raise ValueError(f"Missing required fields in LLM response: {', '.join(missing_fields)}")

    # Validate numeric fields
    if not isinstance(recommendation['recommendedMatchPercentage'], (int, float)):
        raise ValueError("recommendedMatchPercentage must be a number")

    if not isinstance(recommendation['recommendedMonthlyMatchAmount'], (int, float)):
        raise ValueError("recommendedMonthlyMatchAmount must be a number")

    if not isinstance(recommendation['recommendedAnnualMatchAmount'], (int, float)):
        raise ValueError("recommendedAnnualMatchAmount must be a number")


def create_fallback_recommendation(
    monthly_salary: float,
    monthly_emi: float,
    employer_policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a safe fallback recommendation based on debt-to-income ratio
    Applies ALL caps: monthly, annual, and salary percentage
    """
    dti_ratio = calculate_debt_to_income_ratio(monthly_emi, monthly_salary)

    # Conservative recommendation based on DTI
    if dti_ratio < 15:
        match_percentage = 100
        risk = "low"
    elif dti_ratio < 25:
        match_percentage = 75
        risk = "medium"
    else:
        match_percentage = 50
        risk = "high"

    # Get policy limits
    max_monthly_cap = float(employer_policy.get('maxMonthlyMatchCap', 500))
    max_annual_cap = float(employer_policy.get('maxAnnualMatchCap', 5500))
    max_salary_percentage = float(employer_policy.get('maxSalaryPercentageCap', Config.DEFAULT_SALARY_MATCH_CAP_PERCENTAGE))

    # Calculate salary-based limit
    annual_salary = monthly_salary * 12
    max_annual_based_on_salary = annual_salary * (max_salary_percentage / 100)
    max_monthly_based_on_salary = max_annual_based_on_salary / 12

    print(f"Fallback Recommendation - Policy Limits:")
    print(f"  - Monthly Cap: ${max_monthly_cap}")
    print(f"  - Annual Cap: ${max_annual_cap}")
    print(f"  - Salary % Cap: {max_salary_percentage}% of ${annual_salary:,.2f} = ${max_annual_based_on_salary:,.2f}/year")

    # Calculate theoretical match amount
    theoretical_monthly_match = monthly_emi * (match_percentage / 100)

    # Apply ALL three constraints (take minimum)
    monthly_match = min(
        theoretical_monthly_match,
        max_monthly_cap,
        max_monthly_based_on_salary
    )

    # Determine which cap was applied
    if monthly_match == max_monthly_based_on_salary:
        cap_applied = f"salary_percentage ({max_salary_percentage}%)"
    elif monthly_match == max_monthly_cap:
        cap_applied = "monthly_policy"
    else:
        cap_applied = "none"

    annual_match = min(monthly_match * 12, max_annual_cap, max_annual_based_on_salary)

    print(f"  - Theoretical Match: ${theoretical_monthly_match:.2f}/month")
    print(f"  - Actual Match: ${monthly_match:.2f}/month (limited by {cap_applied})")

    return {
        "recommendedMatchPercentage": match_percentage,
        "recommendedMonthlyMatchAmount": round(monthly_match, 2),
        "recommendedAnnualMatchAmount": round(annual_match, 2),
        "rationale": f"Fallback recommendation based on {dti_ratio}% debt-to-income ratio. Match limited by {cap_applied}. Manual review recommended.",
        "riskAssessment": risk,
        "capApplied": cap_applied,
        "alternativeOptions": [],
        "financialHealthScore": max(50, 100 - int(dti_ratio * 2)),
        "recommendations": [
            "Review financial data for accuracy",
            "Consult with financial advisor for personalized guidance",
            f"Consider starting with conservative {match_percentage}% match",
            "Monitor monthly budget and adjust as needed"
        ],
        "taxBenefits": f"Estimated annual tax benefit of ${round(annual_match * Config.DEFAULT_TAX_BRACKET, 2)} (at 22% bracket)",
        "projectedOutcomes": {
            "5years": f"Projected retirement value: ${round(annual_match * 5 * 1.34, 2)}",
            "10years": f"Projected retirement value: ${round(annual_match * 10 * 1.79, 2)}",
            "atLoanPayoff": f"Total match contribution over loan term"
        }
    }


def parse_llm_response(
    llm_response: Dict[str, Any],
    loan_data: Dict[str, Any],
    salary_data: Dict[str, Any],
    employer_policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Parse and validate LLM JSON response with robust error handling
    """
    try:
        # Extract content from LLM response
        content = llm_response['choices'][0]['message']['content']

        # Clean markdown formatting
        content = clean_llm_content(content)

        # Parse JSON
        recommendation = json.loads(content)

        # Validate required fields
        validate_recommendation(recommendation)

        print("LLM response parsed and validated successfully")
        return recommendation

    except (KeyError, IndexError) as e:
        print(f"Error extracting content from LLM response: {str(e)}")
        print(f"Response structure: {json.dumps(llm_response, indent=2)}")

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from LLM response: {str(e)}")
        print(f"Content attempted to parse: {content if 'content' in locals() else 'N/A'}")

    except ValueError as e:
        print(f"Validation error: {str(e)}")

    except Exception as e:
        print(f"Unexpected error parsing LLM response: {str(e)}")

    # Create fallback recommendation - ALL IN USD
    print("Creating fallback recommendation (USD calculations)")

    TARGET_CURRENCY = 'USD'

    # Get salary in USD
    monthly_salary_usd = float(salary_data.get('netSalary', 0))

    # Convert loan to USD if needed
    loan_currency = loan_data.get('currency', 'INR')
    loan_amount_original = float(loan_data.get('loanAmount', 0))

    if loan_currency == TARGET_CURRENCY:
        loan_amount_usd = loan_amount_original
    else:
        exchange_rate = get_exchange_rate(loan_currency, TARGET_CURRENCY)
        loan_amount_usd = loan_amount_original * exchange_rate

    # Calculate monthly EMI in USD
    monthly_emi_usd = calculate_monthly_emi(
        loan_amount_usd,
        float(loan_data.get('interestRate', 0)),
        int(loan_data.get('loanTenure', 0))
    )

    return create_fallback_recommendation(monthly_salary_usd, monthly_emi_usd, employer_policy)


# ============================================================================
# FINANCIAL PROJECTIONS
# ============================================================================

def calculate_projections(
    loan_data: Dict[str, Any],
    salary_data: Dict[str, Any],
    recommendation: Dict[str, Any],
    employer_policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate detailed financial projections with compound interest
    ALL CALCULATIONS IN USD
    """
    # Target currency is always USD
    TARGET_CURRENCY = 'USD'

    # Get salary in USD
    monthly_salary_usd = float(salary_data.get('netSalary', 0))
    annual_salary_usd = monthly_salary_usd * 12

    # Get match amounts (already in USD from recommendation)
    monthly_match_usd = float(recommendation.get('recommendedMonthlyMatchAmount', 0))
    annual_match_usd = float(recommendation.get('recommendedAnnualMatchAmount', 0))

    # Convert loan to USD if needed
    loan_currency = loan_data.get('currency', 'INR')
    loan_amount_original = float(loan_data.get('loanAmount', 0))

    if loan_currency == TARGET_CURRENCY:
        loan_amount_usd = loan_amount_original
        exchange_rate = 1.0
    else:
        exchange_rate = get_exchange_rate(loan_currency, TARGET_CURRENCY)
        loan_amount_usd = loan_amount_original * exchange_rate

    loan_tenure = int(loan_data.get('loanTenure', 0))

    # Calculate monthly EMI in USD
    monthly_emi_usd = calculate_monthly_emi(
        loan_amount_usd,
        float(loan_data.get('interestRate', 0)),
        loan_tenure
    )

    # Get salary cap info
    max_salary_percentage = float(employer_policy.get('maxSalaryPercentageCap', Config.DEFAULT_SALARY_MATCH_CAP_PERCENTAGE))
    max_annual_based_on_salary = annual_salary_usd * (max_salary_percentage / 100)
    max_monthly_based_on_salary = max_annual_based_on_salary / 12

    print(f"Projections calculated in USD:")
    print(f"  - Loan Amount: ${loan_amount_usd:,.2f}")
    print(f"  - Monthly EMI: ${monthly_emi_usd:,.2f}")
    print(f"  - Monthly Match: ${monthly_match_usd:,.2f}")
    print(f"  - Annual Match: ${annual_match_usd:,.2f}")
    print(f"  - Salary Cap Limit: {max_salary_percentage}% = ${max_monthly_based_on_salary:,.2f}/month")

    # Calculate retirement projections using future value of annuity
    projections = {
        "currency": TARGET_CURRENCY,
        "note": "All amounts in USD",
        "monthlyBreakdown": {
            "netSalary": round(monthly_salary_usd, 2),
            "loanPayment": round(monthly_emi_usd, 2),
            "matchContribution": round(monthly_match_usd, 2),
            "remainingIncome": round(monthly_salary_usd - monthly_emi_usd, 2),
            "effectiveIncomeAfterMatch": round(monthly_salary_usd - monthly_emi_usd + monthly_match_usd, 2)
        },
        "annualSummary": {
            "totalMatchContribution": round(annual_match_usd, 2),
            "projectedRetirementValue10Years": round(annual_match_usd * Config.PROJECTION_10Y, 2),
            "projectedRetirementValue20Years": round(annual_match_usd * Config.PROJECTION_20Y, 2),
            "projectedRetirementValue30Years": round(annual_match_usd * Config.PROJECTION_30Y, 2),
            "totalLoanPrincipalReduction": round(monthly_match_usd * 12 * loan_tenure, 2)
        },
        "debtToIncomeImpact": {
            "beforeMatch": round(calculate_debt_to_income_ratio(monthly_emi_usd, monthly_salary_usd), 2),
            "afterMatch": round(calculate_debt_to_income_ratio(
                max(0, monthly_emi_usd - monthly_match_usd),
                monthly_salary_usd
            ), 2),
            "improvement": round(calculate_debt_to_income_ratio(monthly_match_usd, monthly_salary_usd), 2)
        },
        "taxSavings": {
            "annualTaxBenefit": round(annual_match_usd * Config.DEFAULT_TAX_BRACKET, 2),
            "lifetimeTaxSavings": round(annual_match_usd * loan_tenure * Config.DEFAULT_TAX_BRACKET, 2),
            "effectiveCostReduction": round(monthly_emi_usd - (monthly_match_usd * (1 - Config.DEFAULT_TAX_BRACKET)), 2)
        },
        "loanPayoffProjection": {
            "originalLoanAmountUSD": round(loan_amount_usd, 2),
            "originalTenureYears": loan_tenure,
            "withMatchSupport": "Accelerated payoff potential with employer match",
            "interestSavings": "Varies based on payment strategy"
        },
        "salaryCapInfo": {
            "annualSalary": round(annual_salary_usd, 2),
            "maxSalaryPercentage": max_salary_percentage,
            "maxMonthlyBasedOnSalary": round(max_monthly_based_on_salary, 2),
            "maxAnnualBasedOnSalary": round(max_annual_based_on_salary, 2),
            "isMatchLimitedBySalaryCap": monthly_match_usd >= max_monthly_based_on_salary - 0.01
        },
        "conversionInfo": {
            "originalCurrency": loan_currency,
            "originalLoanAmount": round(loan_amount_original, 2),
            "exchangeRate": round(exchange_rate, 4) if loan_currency != TARGET_CURRENCY else None,
            "allCalculationsInUSD": True
        }
    }

    return projections


# ============================================================================
# DASHBOARD & NEXT STEPS
# ============================================================================

def generate_dashboard_data(
    recommendation: Dict[str, Any],
    projections: Dict[str, Any],
    loan_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate dashboard fields for employee portal
    """
    return {
        "programApproval": {
            "status": "Pending",
            "matchPercentage": recommendation.get('recommendedMatchPercentage'),
            "maxAnnualMatch": recommendation.get('recommendedAnnualMatchAmount'),
            "policyCompliant": True,
            "capApplied": recommendation.get('capApplied', 'unknown')
        },
        "currentPeriodProgress": {
            "currentMonth": datetime.utcnow().strftime('%B %Y'),
            "monthlyMatchEarned": 0,
            "monthlyMatchPending": recommendation.get('recommendedMonthlyMatchAmount'),
            "ytdMatchEarned": 0,
            "nextPaymentDate": "Pending enrollment"
        },
        "progressMetrics": {
            "annualLimitUsed": 0,
            "annualLimitRemaining": recommendation.get('recommendedAnnualMatchAmount'),
            "percentOfLimitUsed": 0,
            "onTrackForMaxMatch": True,
            "projectedYearEndTotal": recommendation.get('recommendedAnnualMatchAmount')
        },
        "financialHealth": {
            "healthScore": recommendation.get('financialHealthScore', 70),
            "riskLevel": recommendation.get('riskAssessment', 'medium').lower(),
            "debtToIncomeRatio": projections['debtToIncomeImpact']['beforeMatch'],
            "improvementWithMatch": projections['debtToIncomeImpact']['improvement']
        },
        "retirementProjection": {
            "value10Years": projections['annualSummary']['projectedRetirementValue10Years'],
            "value20Years": projections['annualSummary']['projectedRetirementValue20Years'],
            "value30Years": projections['annualSummary']['projectedRetirementValue30Years']
        },
        "salaryCapInfo": projections.get('salaryCapInfo', {})
    }


def generate_next_steps(recommendation: Dict[str, Any]) -> List[str]:
    """
    Generate actionable next steps for employee and admin
    """
    steps = [
        f"Admin to review and approve {recommendation.get('recommendedMatchPercentage')}% match recommendation",
        f"Employee to enroll in SECURE 2.0 student loan match program",
        f"Set up automatic loan payment verification (${recommendation.get('recommendedMonthlyMatchAmount')}/month)",
        "Complete 401(k) retirement plan enrollment if not already enrolled",
        "Link student loan servicer account for automated payment verification",
        "Review and acknowledge program terms and conditions",
        f"First match contribution expected within 2-3 pay periods after approval"
    ]

    # Add LLM-generated recommendations
    llm_recommendations = recommendation.get('recommendations', [])
    if llm_recommendations:
        steps.append("--- Additional Financial Recommendations ---")
        steps.extend(llm_recommendations[:3])

    return steps


# ============================================================================
# MAIN LAMBDA HANDLER
# ============================================================================

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda function to calculate optimal retirement match using LLM
    """
    try:
        if 'body' in event and isinstance(event['body'], str):
            print("API Gateway invocation detected")
            try:
                event = json.loads(event['body'])
                print("Successfully parsed API Gateway body")
            except json.JSONDecodeError as e:
                print(f"Error parsing API Gateway body: {e}")
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid JSON in request body'})
                }
        print(f"Event received: {json.dumps(event, default=str)}")

        # Step 1: Validate input
        validate_input(event)

        # Parse input
        asu_id = event.get('asuId')
        loan_data = event.get('loanApplication', {})
        salary_data = event.get('salaryVerification', {})
        employer_policy = event.get('employerMatchPolicy', {
            'maxMonthlyMatchCap': 500,
            'maxAnnualMatchCap': 5500,
            'maxSalaryPercentageCap': 6.0,
            'matchPercentageOptions': [50, 75, 100]
        })

        # Ensure default salary cap if not provided
        if 'maxSalaryPercentageCap' not in employer_policy:
            employer_policy['maxSalaryPercentageCap'] = Config.DEFAULT_SALARY_MATCH_CAP_PERCENTAGE

        print(f"Processing recommendation for ASU ID: {asu_id}")

        # Step 2: Prepare structured input for LLM
        llm_input = prepare_llm_input(loan_data, salary_data, employer_policy)
        print(f"LLM input prepared successfully")

        # Step 3: Call LLM API with Cognito auth
        llm_response = call_llm_api_with_cognito_auth(llm_input)
        print(f"LLM response received")

        # Step 4: Parse LLM response
        recommendation = parse_llm_response(
            llm_response,
            loan_data,
            salary_data,
            employer_policy
        )
        print(f"Recommendation: {recommendation['recommendedMatchPercentage']}% match, "
              f"${recommendation['recommendedMonthlyMatchAmount']}/month")

        # Step 5: Calculate detailed financial projections
        financial_projections = calculate_projections(
            loan_data,
            salary_data,
            recommendation,
            employer_policy
        )

        # Step 6: Build complete output
        output = {
            'asuId': asu_id,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'recommendation': recommendation,
            'financialProjections': financial_projections,
            'approvalStatus': 'Pending',
            'nextSteps': generate_next_steps(recommendation),
            'dashboardData': generate_dashboard_data(
                recommendation,
                financial_projections,
                loan_data
            ),
            'metadata': {
                'exchangeRate': llm_input['studentLoan'].get('exchangeRate'),
                'calculationDate': datetime.utcnow().isoformat() + 'Z',
                'calculationCurrency': 'USD',
                'originalLoanCurrency': loan_data.get('currency', 'INR'),
                'originalLoanAmount': float(loan_data.get('loanAmount', 0)),
                'convertedLoanAmountUSD': llm_input['studentLoan'].get('totalAmountUSD'),
                'salaryCapPercentage': employer_policy.get('maxSalaryPercentageCap'),
                'version': '2.1'
            }
        }

        print(f"Output generated successfully")

        # Step 7: Save to DynamoDB
        print(f"Saving recommendation to DynamoDB...")
        save_recommendation_to_profile(
            asu_id=asu_id,
            loan_data=loan_data,
            salary_data=salary_data,
            recommendation=recommendation,
            financial_projections=financial_projections,
            dashboard_data=output['dashboardData'],
            metadata=output['metadata']
        )
        print(f"Recommendation saved to DynamoDB successfully")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(output, default=decimal_default)
        }

    except ValidationError as e:
        print(f"Validation error: {str(e)}")
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Validation Error',
                'message': str(e),
                'type': 'ValidationError'
            })
        }

    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal Server Error',
                'message': str(e),
                'type': type(e).__name__
            })
        }


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def decimal_default(obj: Any) -> float:
    """
    JSON serializer for Decimal objects
    """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


# ============================================================================
# LOCAL TESTING
# ============================================================================

def main():
    """
    Test function for local development
    """
    test_event = {
        "asuId": "1234567890",
        "loanApplication": {
            "applicantName": "Shivam Gunvant Sonawane",
            "applicationDate": "2024-01-24",
            "currency": "INR",
            "interestRate": 11.75,
            "loanAmount": 5000000,
            "loanProvider": "HDFC Credila Financial Services Limited",
            "loanTenure": 14,
            "loanType": "UNSECURED",
            "sanctionedAmount": 5000000
        },
        "salaryVerification": {
            "currency": "USD",
            "deductions": 3.35,
            "employeeName": "Shivam Gunvant Sonawane",
            "employerName": "Arizona State University",
            "grossSalary": 752.4,
            "month": "September 2025",
            "netSalary": 755.75
        },
        "employerMatchPolicy": {
            "maxMonthlyMatchCap": 500,
            "maxAnnualMatchCap": 5500,
            "maxSalaryPercentageCap": 6.0,
            "matchPercentageOptions": [50, 75, 100],
            "minimumMonthlyPayment": 100,
            "eligibleLoanTypes": ["Federal", "Private", "International"],
            "vestingSchedule": "Immediate",
            "verificationMethod": "Automated",
            "enrollmentWindow": {
                "start": "2025-01-01",
                "end": "2025-12-31"
            }
        }
    }

    print("=" * 80)
    print("TESTING LAMBDA HANDLER LOCALLY")
    print("=" * 80)

    result = lambda_handler(test_event, None)

    print("\n" + "=" * 80)
    print("RESULT")
    print("=" * 80)
    print(f"Status Code: {result['statusCode']}")
    print("\nResponse Body:")

    if result['statusCode'] == 200:
        body = json.loads(result['body'])
        print(json.dumps(body, indent=2))

        print("\n" + "=" * 80)
        print("KEY METRICS")
        print("=" * 80)
        print(f"Recommended Match: {body['recommendation']['recommendedMatchPercentage']}%")
        print(f"Monthly Match: ${body['recommendation']['recommendedMonthlyMatchAmount']}")
        print(f"Annual Match: ${body['recommendation']['recommendedAnnualMatchAmount']}")
        print(f"Cap Applied: {body['recommendation'].get('capApplied', 'N/A')}")
        print(f"Risk Assessment: {body['recommendation']['riskAssessment']}")
        print(f"Financial Health Score: {body['recommendation']['financialHealthScore']}/100")
        print(f"\nSalary Cap Info:")
        print(f"  - Salary Cap: {body['metadata']['salaryCapPercentage']}%")
        print(f"  - Max Monthly (Salary): ${body['financialProjections']['salaryCapInfo']['maxMonthlyBasedOnSalary']}")
        print(f"  - Limited by Salary Cap: {body['financialProjections']['salaryCapInfo']['isMatchLimitedBySalaryCap']}")
        print(f"\nDebt-to-Income Ratio:")
        print(f"  Before Match: {body['financialProjections']['debtToIncomeImpact']['beforeMatch']}%")
        print(f"  After Match: {body['financialProjections']['debtToIncomeImpact']['afterMatch']}%")
        print(f"\nRetirement Projections:")
        print(f"  10 Years: ${body['financialProjections']['annualSummary']['projectedRetirementValue10Years']:,.2f}")
        print(f"  20 Years: ${body['financialProjections']['annualSummary']['projectedRetirementValue20Years']:,.2f}")
        print(f"  30 Years: ${body['financialProjections']['annualSummary']['projectedRetirementValue30Years']:,.2f}")
        print(f"\nTax Savings:")
        print(f"  Annual: ${body['financialProjections']['taxSavings']['annualTaxBenefit']:,.2f}")
        print(f"  Lifetime: ${body['financialProjections']['taxSavings']['lifetimeTaxSavings']:,.2f}")
    else:
        print(json.dumps(json.loads(result['body']), indent=2))


if __name__ == "__main__":
    main()