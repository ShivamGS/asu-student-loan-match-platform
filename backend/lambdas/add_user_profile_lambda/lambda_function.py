import json
import boto3
import os
import bcrypt
from datetime import datetime

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('USER_PROFILES_TABLE', 'asu-user-profiles'))

def lambda_handler(event, context):
    """
    Lambda function to handle user signup and login

    Expected input for signup:
    {
        "operation": "signup",
        "asuId": "1234567890",
        "asuEmail": "john.doe@asu.edu",
        "firstName": "John",
        "lastName": "Doe",
        "password": "securePassword123"
    }

    Expected input for login:
    {
        "operation": "login",
        "asuId": "1234567890",
        "password": "securePassword123"
    }
    """

    print(f"Received event: {json.dumps(event)}")

    try:
        # Parse request body
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event

        operation = body.get('operation', '').lower()

        if operation == 'signup':
            return handle_signup(body)
        elif operation == 'login':
            return handle_login(body)
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Invalid operation',
                    'message': 'Operation must be either "signup" or "login"'
                })
            }

    except json.JSONDecodeError as json_error:
        print(f"JSON decode error: {json_error}")
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid JSON',
                'message': str(json_error)
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }


def handle_signup(body):
    """Handle user signup with password hashing"""

    # Extract and validate required fields
    asu_id = body.get('asuId', '').strip()
    asu_email = body.get('asuEmail', '').strip()
    first_name = body.get('firstName', '').strip()
    last_name = body.get('lastName', '').strip()
    password = body.get('password', '')

    # Validation
    errors = []

    if not asu_id:
        errors.append("asuId is required")
    elif not asu_id.isalnum():
        errors.append("asuId must be alphanumeric")

    if asu_email and not asu_email.endswith('@asu.edu'):
        errors.append("asuEmail must be a valid ASU email (ending with @asu.edu)")

    if not first_name:
        errors.append("firstName is required")

    if not last_name:
        errors.append("lastName is required")

    if not password:
        errors.append("password is required")
    elif len(password) < 8:
        errors.append("password must be at least 8 characters long")
    elif len(password) > 72:
        errors.append("password must not exceed 72 characters (bcrypt limitation)")

    if errors:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Validation failed',
                'details': errors
            })
        }

    # Check if profile already exists
    print(f"Checking if profile exists for asuId: {asu_id}")

    try:
        existing_profile = table.get_item(Key={'asuId': asu_id})

        if 'Item' in existing_profile:
            print(f"Profile already exists for asuId: {asu_id}")
            return {
                'statusCode': 409,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Profile already exists',
                    'message': f'User profile for ASU ID {asu_id} already exists.'
                })
            }
    except Exception as check_error:
        print(f"Error checking existing profile: {check_error}")
        if 'ResourceNotFoundException' not in str(check_error):
            raise

    # Hash the password using bcrypt with 12 rounds (recommended for security)
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    # Create user profile item
    timestamp = datetime.now().isoformat()
    user_profile = {
        'asuId': asu_id,
        'firstName': first_name,
        'lastName': last_name,
        'passwordHash': hashed_password.decode('utf-8'),  # Store as string
        'approvalStatus': 'action_required',
        'createdAt': timestamp,
        'updatedAt': timestamp
    }

    # Add optional email if provided
    if asu_email:
        user_profile['asuEmail'] = asu_email

    # Optional fields from student loan data
    optional_fields = ['debtAmount', 'salary', 'repaymentPeriod', 'interestRate']
    for field in optional_fields:
        if field in body and body[field]:
            user_profile[field] = body[field]

    print(f"Creating user profile: {json.dumps({k: v for k, v in user_profile.items() if k != 'passwordHash'}, default=str)}")

    # Save to DynamoDB
    table.put_item(Item=user_profile)

    print(f"Successfully created profile for ASU ID: {asu_id}")

    # Return success response (don't include password hash)
    return {
        'statusCode': 201,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'User profile created successfully',
            'asuId': asu_id,
            'approvalStatus': 'action_required'
        }, default=str)
    }


def handle_login(body):
    """Handle user login with password verification"""

    # Extract and validate required fields
    asu_id = body.get('asuId', '').strip()
    password = body.get('password', '')

    # Validation
    if not asu_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Validation failed',
                'message': 'asuId is required'
            })
        }

    if not password:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Validation failed',
                'message': 'password is required'
            })
        }

    # Retrieve user from database
    print(f"Attempting login for asuId: {asu_id}")

    try:
        response = table.get_item(Key={'asuId': asu_id})

        if 'Item' not in response:
            print(f"User not found: {asu_id}")
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Authentication failed',
                    'message': 'Invalid credentials'
                })
            }

        user = response['Item']

        # Check if user has password hash (for backward compatibility with existing users)
        if 'passwordHash' not in user:
            print(f"User {asu_id} does not have a password set")
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Authentication failed',
                    'message': 'Account needs to be migrated. Please use signup to set a password.'
                })
            }

        # Verify password using bcrypt
        password_bytes = password.encode('utf-8')
        stored_hash = user['passwordHash'].encode('utf-8')

        if bcrypt.checkpw(password_bytes, stored_hash):
            print(f"Login successful for asuId: {asu_id}")

            # Update last login timestamp
            timestamp = datetime.now().isoformat()
            table.update_item(
                Key={'asuId': asu_id},
                UpdateExpression='SET lastLogin = :timestamp',
                ExpressionAttributeValues={':timestamp': timestamp}
            )

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Login successful',
                    'asuId': asu_id,
                    'firstName': user.get('firstName'),
                    'lastName': user.get('lastName'),
                    'asuEmail': user.get('asuEmail'),
                    'approvalStatus': user.get('approvalStatus')
                }, default=str)
            }
        else:
            print(f"Invalid password for asuId: {asu_id}")
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Authentication failed',
                    'message': 'Invalid credentials'
                })
            }

    except Exception as e:
        print(f"Error during login: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': 'An error occurred during login'
            })
        }