import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

logger.info("Loading College Scorecard data from Excel...")
df_colleges = pd.read_excel('most_recent_institution_data.xlsx')

logger.info("Converting GRAD_DEBT_MDN and MD_EARN_WNE_P10 to numeric (coerce errors to NaN)...")
df_colleges['GRAD_DEBT_MDN'] = pd.to_numeric(df_colleges['GRAD_DEBT_MDN'], errors='coerce')
df_colleges['MD_EARN_WNE_P10'] = pd.to_numeric(df_colleges['MD_EARN_WNE_P10'], errors='coerce')

logger.info("Filtering valid rows for debt and earnings...")
df_valid = df_colleges[
    (df_colleges['GRAD_DEBT_MDN'].notna()) &
    (df_colleges['GRAD_DEBT_MDN'] > 0) &
    (df_colleges['MD_EARN_WNE_P10'].notna()) &
    (df_colleges['MD_EARN_WNE_P10'] > 0)
].copy()
logger.info(f"Valid college rows: {len(df_valid)}")

np.random.seed(42)
n_employees = 1000
logger.info(f"Generating {n_employees} synthetic employee records...")

# Employee identity and contact info
employee_data = pd.DataFrame({
    'asu_id': [f'ASU{str(i).zfill(8)}' for i in range(1, n_employees + 1)],
    'first_name': np.random.choice(['John','Jane','Michael','Sarah','David','Emily',
                                   'Daniel','Jessica','Robert','Maria','James','Lisa',
                                   'Christopher','Jennifer','Matthew','Amanda'], n_employees),
    'last_name': np.random.choice(['Smith','Johnson','Williams','Brown','Jones',
                                  'Garcia','Miller','Davis','Rodriguez','Martinez',
                                  'Anderson','Taylor','Thomas','Moore','Jackson'], n_employees),
    'email': [f'employee{i}@asu.edu' for i in range(1, n_employees + 1)]
})
logger.info("Employee base data created.")

# Student Worker Salary generation ($15/hr, 20-40h/wk, 32w/year)
logger.info("Generating student worker salaries...")
hourly_rate = 15
hours_per_week = np.random.choice([20, 30, 40], size=n_employees, p=[0.85, 0.10, 0.05])
weeks_per_year = 32
summer_multiplier = np.random.choice([1, 1.25], size=n_employees, p=[0.80, 0.20])
student_salary_monthly = ((hourly_rate * hours_per_week * weeks_per_year) / 12) * summer_multiplier
employee_data['student_salary_monthly'] = student_salary_monthly.round(2)
logger.debug(f"Sample student salaries: {employee_data['student_salary_monthly'].head()}")

# ------ GRADUATE-LEVEL DEBT ADJUSTMENT ------
logger.info("Sampling and scaling debt for realistic graduate student debt levels...")
# Scale median undergrad debt to grad level (~2.7x typical, $70k-$80k mean)
grad_debt_distribution = df_valid['GRAD_DEBT_MDN'].values * 2.7

has_debt_probability = 0.80

employee_data['total_student_debt'] = np.where(
    np.random.random(n_employees) < has_debt_probability,
    np.random.choice(grad_debt_distribution, n_employees, replace=True) * np.random.uniform(0.85, 1.15, n_employees),
    0
).round(-2).astype(int)
# Clip to reasonable min $30000 and max $175000
employee_data.loc[employee_data['total_student_debt'] > 0, 'total_student_debt'] = (
    employee_data.loc[employee_data['total_student_debt'] > 0, 'total_student_debt'].clip(lower=30000, upper=175000)
)
logger.info(f"Average graduate-level debt: ${employee_data[employee_data['total_student_debt'] > 0]['total_student_debt'].mean():,.0f}")

# Post-grad annual salary generation (still using 10yr after grad median)
logger.info("Generating post-grad annual salaries...")
actual_earnings_distribution = df_valid['MD_EARN_WNE_P10'].values
employee_data['annual_salary'] = (
    np.random.choice(actual_earnings_distribution, n_employees, replace=True) *
    np.random.uniform(0.8, 1.3, n_employees)
).round(-3).astype(int)
employee_data['annual_salary'] = employee_data['annual_salary'].clip(lower=35000, upper=120000)
employee_data['monthly_salary_gross'] = (employee_data['annual_salary'] / 12).round(2)
employee_data['monthly_salary_net'] = (employee_data['monthly_salary_gross'] * 0.75).round(2)

# Student loan interest rates (current typical federal grad rates 4.99%-7.05%)
logger.info("Assigning interest rates...")
federal_rates = [4.99, 5.28, 5.50, 6.08, 6.54, 7.05]
employee_data['interest_rate'] = np.where(
    employee_data['total_student_debt'] > 0,
    np.random.choice(federal_rates, n_employees),
    0.0
)

# Repayment period
logger.info("Assigning repayment periods based on debt...")
def assign_repayment_period(debt):
    if debt == 0:
        return 0
    elif debt < 60000:
        return np.random.choice([10, 15], p=[0.65, 0.35])
    elif debt < 100000:
        return np.random.choice([10, 15, 20], p=[0.35, 0.30, 0.35])
    else:
        return np.random.choice([15, 20, 25], p=[0.3, 0.5, 0.2])
employee_data['repayment_period_years'] = employee_data['total_student_debt'].apply(assign_repayment_period)

# EMI calculator
logger.info("Calculating monthly EMI for each employee...")
def calculate_emi(principal, annual_rate, years):
    if principal == 0 or years == 0: return 0
    monthly_rate = (annual_rate / 100) / 12
    num_payments = years * 12
    if monthly_rate == 0: return principal / num_payments
    emi = principal * monthly_rate * (1 + monthly_rate)**num_payments / ((1 + monthly_rate)**num_payments - 1)
    return round(emi, 2)
employee_data['monthly_emi'] = employee_data.apply(
    lambda row: calculate_emi(row['total_student_debt'], row['interest_rate'], row['repayment_period_years']),
    axis=1
)

# Loan Progress
logger.info("Simulating loan progress and remaining balances...")
current_date = datetime.now()
employee_data['loan_start_date'] = [
    (current_date - timedelta(days=np.random.randint(365, 3650))).strftime('%Y-%m-%d')
    if debt > 0 else 'N/A'
    for debt in employee_data['total_student_debt']
]
employee_data['months_elapsed'] = employee_data.apply(
    lambda row: ((current_date - datetime.strptime(row['loan_start_date'], '%Y-%m-%d')).days // 30)
    if row['loan_start_date'] != 'N/A' else 0,
    axis=1
)
employee_data['payments_made'] = np.minimum(
    employee_data['months_elapsed'],
    employee_data['repayment_period_years'] * 12
)
employee_data['remaining_balance'] = np.maximum(
    employee_data['total_student_debt'] - (employee_data['payments_made'] * employee_data['monthly_emi'] * 0.65),
    0
).round(2)
employee_data['years_remaining'] = np.maximum(
    employee_data['repayment_period_years'] - (employee_data['months_elapsed'] / 12),
    0
).round(1)

# Debt-to-income and status
logger.info("Calculating debt-to-income ratios and repayment status...")
employee_data['debt_to_income_ratio'] = np.where(
    employee_data['monthly_salary_net'] > 0,
    (employee_data['monthly_emi'] / employee_data['monthly_salary_net'] * 100).round(2),
    0
)
def determine_status(row):
    if row['total_student_debt'] == 0:
        return 'No Debt'
    elif row['remaining_balance'] == 0:
        return 'Paid Off'
    elif row['debt_to_income_ratio'] > 15:
        return 'High Burden'
    elif row['debt_to_income_ratio'] > 8:
        return 'Moderate Burden'
    else:
        return 'Manageable'
employee_data['repayment_status'] = employee_data.apply(determine_status, axis=1)

# Retirement contributions based on burden
logger.info("Assigning retirement contribution percentages...")
employee_data['retirement_contribution_pct'] = np.where(
    employee_data['debt_to_income_ratio'] > 15,
    np.random.uniform(0, 5, n_employees),
    np.where(
        employee_data['debt_to_income_ratio'] > 8,
        np.random.uniform(3, 10, n_employees),
        np.random.uniform(6, 15, n_employees)
    )
).round(1)
employee_data['monthly_401k_contribution'] = (
    employee_data['monthly_salary_gross'] * employee_data['retirement_contribution_pct'] / 100
).round(2)

# Final selection and export
output_columns = [
    'asu_id', 'first_name', 'last_name', 'email',
    'student_salary_monthly',  # In-school earnings field!
    'total_student_debt', 'interest_rate', 'repayment_period_years',
    'monthly_emi', 'loan_start_date', 'payments_made',
    'remaining_balance', 'years_remaining',
    'annual_salary', 'monthly_salary_gross', 'monthly_salary_net',
    'debt_to_income_ratio', 'repayment_status',
    'retirement_contribution_pct', 'monthly_401k_contribution'
]
output_file = 'asu_grad_student_loan_dataset.csv'
logger.info(f"Saving final dataset to {output_file}...")
employee_data[output_columns].to_csv(output_file, index=False)
logger.info("Data export complete.")
