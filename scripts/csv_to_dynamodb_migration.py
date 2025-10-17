import boto3
import pandas as pd
from datetime import datetime
from decimal import Decimal
import json

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # Change region as needed
table = dynamodb.Table('asu-user-profiles')  # Replace with your actual table name


def convert_to_decimal(value):
    """Convert float/int values to Decimal for DynamoDB"""
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    return value

def safe_string(value):
    """Convert value to string, handling NaN and None"""
    if pd.isna(value) or value is None or value == 'N/A':
        return None
    return str(value)

def migrate_csv_to_dynamodb(csv_file_path):
    """
    Migrate data from CSV file to DynamoDB table
    
    Args:
        csv_file_path: Path to the CSV file
    """
    # Read CSV file
    df = pd.read_csv(csv_file_path)
    
    print(f"Starting migration of {len(df)} records from CSV to DynamoDB...")
    
    success_count = 0
    error_count = 0
    
    for index, row in df.iterrows():
        try:
            # Get current timestamp
            current_timestamp = datetime.utcnow().isoformat()
            
            # Prepare the item for DynamoDB
            # Basic fields mapping
            item = {
                'asuId': str(row['asu_id']),
                'firstName': safe_string(row['first_name']),
                'lastName': safe_string(row['last_name']),
                'asuEmail': safe_string(row['email']),
                'salary': convert_to_decimal(row['monthly_salary_net']),
                'createdAt': current_timestamp,
                'created_at': current_timestamp,
                'updatedAt': current_timestamp,
                'updated_at': current_timestamp,
            }
            
            # Add new fields from CSV
            if not pd.isna(row['monthly_401k_contribution']):
                item['monthly_401k_contribution'] = convert_to_decimal(row['monthly_401k_contribution'])
            
            if safe_string(row['repayment_status']):
                item['repayment_status'] = safe_string(row['repayment_status'])
            
            if not pd.isna(row['monthly_emi']):
                item['monthly_emi'] = convert_to_decimal(row['monthly_emi'])
            
            if not pd.isna(row['remaining_balance']):
                item['remaining_balance'] = convert_to_decimal(row['remaining_balance'])
            
            # Build loanApplication nested structure
            loan_application = {}
            
            if not pd.isna(row['total_student_debt']):
                loan_application['loanAmount'] = convert_to_decimal(row['total_student_debt'])
                loan_application['currency'] = 'USD'  # Assuming USD based on the data
            
            if not pd.isna(row['interest_rate']):
                loan_application['interestRate'] = convert_to_decimal(row['interest_rate'])
            
            if not pd.isna(row['repayment_period_years']):
                loan_application['loanTenure'] = convert_to_decimal(row['repayment_period_years'])
            
            # Add applicant name if we have it
            full_name_parts = []
            if safe_string(row['first_name']):
                full_name_parts.append(safe_string(row['first_name']))
            if safe_string(row['last_name']):
                full_name_parts.append(safe_string(row['last_name']))
            if full_name_parts:
                loan_application['applicantName'] = ' '.join(full_name_parts)
            
            if loan_application:
                item['loanApplication'] = loan_application
            
            # Build latestRecommendation nested structure with debt_to_income_ratio
            if not pd.isna(row['debt_to_income_ratio']):
                item['latestRecommendation'] = {
                    'financialProjections': {
                        'debtToIncomeImpact': {
                            'afterMatch': convert_to_decimal(row['debt_to_income_ratio'])
                        }
                    },
                    'timestamp': current_timestamp,
                    'status': 'Pending'
                }
            
            # Put item into DynamoDB
            # Check if item exists first by attempting to get it
            try:
                response = table.get_item(Key={'asuId': item['asuId']})
                
                if 'Item' in response:
                    # User exists - update only the mapped fields
                    print(f"Updating existing user: {item['asuId']}")
                    
                    update_expression_parts = []
                    expression_attribute_values = {}
                    expression_attribute_names = {}
                    
                    # Update basic fields
                    if item.get('firstName'):
                        update_expression_parts.append('#fn = :fn')
                        expression_attribute_names['#fn'] = 'firstName'
                        expression_attribute_values[':fn'] = item['firstName']
                    
                    if item.get('lastName'):
                        update_expression_parts.append('#ln = :ln')
                        expression_attribute_names['#ln'] = 'lastName'
                        expression_attribute_values[':ln'] = item['lastName']
                    
                    if item.get('asuEmail'):
                        update_expression_parts.append('asuEmail = :email')
                        expression_attribute_values[':email'] = item['asuEmail']
                    
                    if item.get('salary'):
                        update_expression_parts.append('salary = :salary')
                        expression_attribute_values[':salary'] = item['salary']
                    
                    # Update loanApplication fields
                    if 'loanApplication' in item:
                        if 'loanAmount' in item['loanApplication']:
                            update_expression_parts.append('loanApplication.loanAmount = :loanAmount')
                            expression_attribute_values[':loanAmount'] = item['loanApplication']['loanAmount']
                        
                        if 'currency' in item['loanApplication']:
                            update_expression_parts.append('loanApplication.currency = :currency')
                            expression_attribute_values[':currency'] = item['loanApplication']['currency']
                        
                        if 'interestRate' in item['loanApplication']:
                            update_expression_parts.append('loanApplication.interestRate = :interestRate')
                            expression_attribute_values[':interestRate'] = item['loanApplication']['interestRate']
                        
                        if 'loanTenure' in item['loanApplication']:
                            update_expression_parts.append('loanApplication.loanTenure = :loanTenure')
                            expression_attribute_values[':loanTenure'] = item['loanApplication']['loanTenure']
                    
                    # Update latestRecommendation
                    if 'latestRecommendation' in item:
                        update_expression_parts.append('latestRecommendation.financialProjections.debtToIncomeImpact.afterMatch = :afterMatch')
                        expression_attribute_values[':afterMatch'] = item['latestRecommendation']['financialProjections']['debtToIncomeImpact']['afterMatch']
                    
                    # Add new fields
                    if 'monthly_401k_contribution' in item:
                        update_expression_parts.append('monthly_401k_contribution = :monthly401k')
                        expression_attribute_values[':monthly401k'] = item['monthly_401k_contribution']
                    
                    if 'repayment_status' in item:
                        update_expression_parts.append('repayment_status = :repaymentStatus')
                        expression_attribute_values[':repaymentStatus'] = item['repayment_status']
                    
                    if 'monthly_emi' in item:
                        update_expression_parts.append('monthly_emi = :monthlyEmi')
                        expression_attribute_values[':monthlyEmi'] = item['monthly_emi']
                    
                    if 'remaining_balance' in item:
                        update_expression_parts.append('remaining_balance = :remainingBalance')
                        expression_attribute_values[':remainingBalance'] = item['remaining_balance']
                    
                    # Add updatedAt timestamp
                    update_expression_parts.append('updatedAt = :updatedAt')
                    expression_attribute_values[':updatedAt'] = current_timestamp
                    update_expression_parts.append('updated_at = :updated_at')
                    expression_attribute_values[':updated_at'] = current_timestamp
                    
                    if update_expression_parts:
                        update_expression = 'SET ' + ', '.join(update_expression_parts)
                        
                        update_params = {
                            'Key': {'asuId': item['asuId']},
                            'UpdateExpression': update_expression,
                            'ExpressionAttributeValues': expression_attribute_values
                        }
                        
                        if expression_attribute_names:
                            update_params['ExpressionAttributeNames'] = expression_attribute_names
                        
                        table.update_item(**update_params)
                else:
                    # User doesn't exist - create new item
                    print(f"Creating new user: {item['asuId']}")
                    table.put_item(Item=item)
                
                success_count += 1
                
                if (index + 1) % 10 == 0:
                    print(f"Processed {index + 1}/{len(df)} records...")
                    
            except Exception as inner_error:
                print(f"Error processing record {index + 1} (ASU ID: {row['asu_id']}): {str(inner_error)}")
                error_count += 1
                continue
                
        except Exception as e:
            print(f"Error processing row {index + 1}: {str(e)}")
            error_count += 1
            continue
    
    print(f"\nMigration completed!")
    print(f"Successfully processed: {success_count} records")
    print(f"Errors: {error_count} records")
    return success_count, error_count

if __name__ == "__main__":
    # Usage
    csv_file_path = "asu_grad_student_loan_dataset.csv"
    
    print("=" * 80)
    print("CSV to DynamoDB Migration Script")
    print("=" * 80)
    print()
    
    # Perform migration
    success, errors = migrate_csv_to_dynamodb(csv_file_path)
    
    print()
    print("=" * 80)
    print(f"Migration Summary: {success} successful, {errors} failed")
    print("=" * 80)
