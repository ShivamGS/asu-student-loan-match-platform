import json
import boto3
from decimal import Decimal
import os
from datetime import datetime

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('USERS_TABLE', 'asu-user-profiles')
table = dynamodb.Table(table_name)


def decimal_to_float(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(i) for i in obj]
    return obj


def lambda_handler(event, context):
    """
    Lambda handler with endpoints:
    1. GET /admin/users - Get all users
    2. GET /admin/users/{asuId} - Get specific user
    3. GET /admin/users/{asuId}/documents - Get document URLs [NEW]
    4. GET /admin/users/{asuId}/status - Get approval status [NEW]
    5. POST /admin/users/{asuId}/approval - Update approval status [NEW]
    """

    print(f"Event received: {json.dumps(event)}")

    http_method = event.get('httpMethod', '')
    path = event.get('path', '')

    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

    try:
        # Handle OPTIONS for CORS preflight
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'OK'})
            }

        if http_method == 'GET' and path == '/admin/insights':
            return get_business_insights(headers)

        # Route 1: GET all users
        if http_method == 'GET' and path == '/admin/users':
            return get_all_users(event, headers)

        # Route 2: GET user documents [NEW]
        if http_method == 'GET' and '/documents' in path:
            return get_user_documents(event, headers)

        # Route 3: GET user approval status [NEW]
        if http_method == 'GET' and '/status' in path:
            return get_user_status(event, headers)

        # Route 4: POST approval status [NEW]
        if http_method == 'POST' and '/approval' in path:
            return update_approval_status(event, headers)

        # Route 5: GET specific user by ID
        if http_method == 'GET' and '/admin/users/' in path:
            return get_user_by_id(event, headers)

        # Unknown route
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'error': 'Route not found',
                'path': path,
                'method': http_method
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def get_all_users(event, headers):
    """Get all users with approvalStatus and hasDocuments"""
    try:
        params = event.get('queryStringParameters') or {}
        limit = params.get('limit')

        if limit:
            limit = int(limit)
            print(f"Fetching {limit} users from table: {table_name}")
            response = table.scan(Limit=limit)
            users = response.get('Items', [])

            for user in users:
                docs = user.get('documents', {})
                user['hasDocuments'] = bool(
                    docs.get('loanDocUrl') or docs.get('loanDocKey')
                )

            users = decimal_to_float(users)
            users.sort(key=lambda x: x.get('hasDocuments', False), reverse=True)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'count': len(users),
                    'users': users,
                    'tableName': table_name
                }, indent=2)
            }

        # Fetch ALL users
        print(f"Fetching ALL users from table: {table_name}")
        all_users = []
        last_evaluated_key = None
        page_count = 0

        while True:
            page_count += 1
            print(f"Scanning page {page_count}...")

            if last_evaluated_key:
                response = table.scan(ExclusiveStartKey=last_evaluated_key)
            else:
                response = table.scan()

            items = response.get('Items', [])
            all_users.extend(items)
            print(f"Page {page_count}: Retrieved {len(items)} items. Total: {len(all_users)}")

            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break

        for user in all_users:
            docs = user.get('documents', {})
            user['hasDocuments'] = bool(
                docs.get('loanDocUrl') or docs.get('loanDocKey')
            )

        all_users = decimal_to_float(all_users)
        all_users.sort(key=lambda x: x.get('hasDocuments', False), reverse=True)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'count': len(all_users),
                'users': all_users,
                'tableName': table_name,
                'pagesScanned': page_count
            }, indent=2)
        }

    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'tableName': table_name})
        }


def get_user_by_id(event, headers):
    """Get specific user by asuId"""
    try:
        path = event['path']
        path_parts = path.split('/')
        user_id = path_parts[-1]

        print(f"Fetching user: {user_id}")
        response = table.get_item(Key={'asuId': user_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found', 'userId': user_id})
            }

        user = decimal_to_float(response['Item'])
        docs = user.get('documents', {})
        user['hasDocuments'] = bool(docs.get('loanDocUrl') or docs.get('loanDocKey'))

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'user': user}, indent=2)
        }

    except Exception as e:
        print(f"Error in get_user_by_id: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def get_user_documents(event, headers):
    """Get document URLs from DynamoDB (already pre-signed)"""
    try:
        path = event['path']
        path_parts = path.split('/')
        asu_id = path_parts[-2]

        print(f"Fetching documents for user: {asu_id}")
        response = table.get_item(Key={'asuId': asu_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found', 'asuId': asu_id})
            }

        user = response['Item']
        docs = user.get('documents', {})

        # Check for document URLs
        loan_url = docs.get('loanDocUrl')
        salary_url = docs.get('salaryDocUrl')

        if not loan_url or not salary_url:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'asuId': asu_id,
                    'hasDocuments': False,
                    'message': 'No documents uploaded for this user'
                })
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'asuId': asu_id,
                'hasDocuments': True,
                'documents': {
                    'loan': {
                        'url': loan_url
                    },
                    'salary': {
                        'url': salary_url
                    }
                },
                'uploadedAt': docs.get('uploadedAt')
            }, indent=2)
        }

    except Exception as e:
        print(f"Error in get_user_documents: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def get_user_status(event, headers):
    """Get user approval status"""
    try:
        path = event['path']
        path_parts = path.split('/')
        asu_id = path_parts[-2]

        print(f"Fetching status for user: {asu_id}")
        response = table.get_item(Key={'asuId': asu_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found', 'asuId': asu_id})
            }

        user = response['Item']
        approval_status = user.get('approvalStatus', 'pending')

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'asuId': asu_id,
                'approvalStatus': approval_status,
                'firstName': user.get('firstName'),
                'lastName': user.get('lastName'),
                'email': user.get('asuEmail')
            })
        }

    except Exception as e:
        print(f"Error in get_user_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def update_approval_status(event, headers):
    """Update user approval status"""
    try:
        path = event['path']
        path_parts = path.split('/')
        asu_id = path_parts[-2]

        body = json.loads(event.get('body', '{}'))
        approval_status = body.get('approvalStatus', 'pending')

        valid_statuses = ['pending', 'approved', 'rejected']
        if approval_status not in valid_statuses:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Invalid approval status',
                    'validStatuses': valid_statuses,
                    'received': approval_status
                })
            }

        print(f"Updating approval status for {asu_id}: {approval_status}")
        current_time = datetime.utcnow().isoformat()

        table.update_item(
            Key={'asuId': asu_id},
            UpdateExpression='SET approvalStatus = :status, updatedAt = :time',
            ExpressionAttributeValues={
                ':status': approval_status,
                ':time': current_time
            }
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'asuId': asu_id,
                'approvalStatus': approval_status,
                'message': f'User approval status updated to {approval_status}',
                'updatedAt': current_time
            })
        }

    except Exception as e:
        print(f"Error in update_approval_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def get_business_insights(headers):
    """
    Calculate and return 5 business insights for dashboard analytics.
    Updated for DynamoDB nested map structure (no JSON parsing needed).
    """
    try:
        # Scan all users
        all_users = []
        last_evaluated_key = None
        while True:
            if last_evaluated_key:
                response = table.scan(ExclusiveStartKey=last_evaluated_key)
            else:
                response = table.scan()
            items = response.get('Items', [])
            all_users.extend(items)
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
        all_users = decimal_to_float(all_users)
        total_users = len(all_users)

        # Initialize lists and counters
        status_counts = {"High Burden": 0, "Moderate Burden": 0, "Manageable": 0, "No Debt": 0}
        loan_amounts, interest_rates, dti_list, remaining_balances, monthly_emis = [], [], [], [], []

        for user in all_users:
            # --- Loan details ---
            loan_data = user.get('loanApplication', {})
            if isinstance(loan_data, dict):
                loan_amount = float(loan_data.get('loanAmount', 0))
                interest_rate = float(loan_data.get('interestRate', 0))
            else:
                loan_amount = 0
                interest_rate = 0

            # --- Recommendation details ---
            rec_data = user.get('latestRecommendation', {})
            dti = 0
            if isinstance(rec_data, dict):
                try:
                    dti = float(
                        rec_data.get('financialProjections', {})
                        .get('debtToIncomeImpact', {})
                        .get('afterMatch', 0)
                    )
                except Exception:
                    dti = 0

            # --- Repayment data ---
            remaining = float(user.get('remaining_balance', 0))
            emi = float(user.get('monthly_emi', 0))

            loan_amounts.append(loan_amount)
            interest_rates.append(interest_rate)
            dti_list.append(dti)
            remaining_balances.append(remaining)
            monthly_emis.append(emi)

            # --- Status ---
            status = user.get('repayment_status', 'Unknown')
            if status in status_counts:
                status_counts[status] += 1

        # --- Derived Metrics ---
        avg_dti = round(sum(dti_list) / total_users, 2) if total_users else 0
        above_30 = sum(1 for dti in dti_list if dti > 30)
        above_40 = sum(1 for dti in dti_list if dti > 40)
        dti_distribution = {
            "<10": sum(1 for dti in dti_list if dti < 10),
            "10-20": sum(1 for dti in dti_list if 10 <= dti < 20),
            "20-30": sum(1 for dti in dti_list if 20 <= dti < 30),
            "30-40": sum(1 for dti in dti_list if 30 <= dti < 40),
            ">40": sum(1 for dti in dti_list if dti >= 40)
        }

        total_debt = sum(loan_amounts)
        remaining_debt = sum(remaining_balances)
        paid_off = total_debt - remaining_debt

        # --- Interest Savings ---
        high_interest_count = sum(1 for r in interest_rates if r > 7)
        interest_distribution = {
            "<5": sum(1 for r in interest_rates if 0 < r < 5),
            "5-6": sum(1 for r in interest_rates if 5 <= r < 6),
            "6-7": sum(1 for r in interest_rates if 6 <= r < 7),
            ">7": sum(1 for r in interest_rates if r >= 7)
        }

        potential_savings = 0
        for rate, balance in zip(interest_rates, remaining_balances):
            years = 10  # assume 10 years average
            if rate > 7 and balance > 0:
                current_interest = balance * (rate / 100) * years
                new_interest = balance * (5 / 100) * years
                potential_savings += (current_interest - new_interest)

        # --- ROI Calculation ---
        monthly_emi_total = sum(monthly_emis)
        annual_cost = monthly_emi_total * 0.5 * 12  # 50% match
        high_burden_count = status_counts["High Burden"]
        retained_employees = int(high_burden_count * 0.35)
        turnover_savings = retained_employees * 50000
        roi_percent = round(((turnover_savings - annual_cost) / annual_cost) * 100, 1) if annual_cost else 0

        # --- Final JSON ---
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'insights': {
                    'financialStress': {
                        'highBurdenCount': status_counts["High Burden"],
                        'highBurdenPercent': round(status_counts["High Burden"] / total_users * 100, 1) if total_users else 0,
                        'manageableCount': status_counts["Manageable"],
                        'moderateCount': status_counts["Moderate Burden"],
                        'noDebtCount': status_counts["No Debt"],
                        'totalUsers': total_users
                    },
                    'debtToIncome': {
                        'averageDTI': avg_dti,
                        'above30Count': above_30,
                        'above40Count': above_40,
                        'distribution': dti_distribution
                    },
                    'totalDebt': {
                        'originalDebt': round(total_debt, 2),
                        'remainingDebt': round(remaining_debt, 2),
                        'paidOff': round(paid_off, 2),
                        'averageLoan': round(sum(loan_amounts) / total_users, 2) if total_users else 0
                    },
                    'interestSavings': {
                        'highInterestCount': high_interest_count,
                        'potentialSavings': round(potential_savings, 2),
                        'distribution': interest_distribution,
                        'averageInterestRate': round(sum(interest_rates) / total_users, 2) if total_users else 0
                    },
                    'roi': {
                        'annualCost': round(annual_cost, 2),
                        'retainedEmployees': retained_employees,
                        'turnoverSavings': turnover_savings,
                        'roiPercent': roi_percent
                    }
                }
            }, indent=2)
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
