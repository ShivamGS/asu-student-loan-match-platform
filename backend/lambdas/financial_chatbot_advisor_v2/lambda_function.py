import json
import boto3
import os
from datetime import datetime
import requests

# DynamoDB
dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(os.environ.get('CONNECTIONS_TABLE', 'chatbot-connections'))
sessions_table = dynamodb.Table(os.environ.get('SESSIONS_TABLE', 'chatbot-sessions'))
user_profiles_table = dynamodb.Table(os.environ.get('USER_PROFILES_TABLE', 'asu-user-profiles'))

from complete_auto_refresh_auth import create_client

chatbot_client = None

def initialize_chatbot():
    """Initialize chatbot client (cached across invocations)"""
    global chatbot_client
    if chatbot_client is None:
        chatbot_client = create_client(
            username=os.environ['COGNITO_USERNAME'],
            password=os.environ['COGNITO_PASSWORD'],
            bearer_token=os.environ['BEARER_TOKEN']
        )
    return chatbot_client

def get_apigw_client(event):
    """Get API Gateway management client"""
    domain = event['requestContext']['domainName']
    stage = event['requestContext']['stage']
    return boto3.client('apigatewaymanagementapi', endpoint_url=f"https://{domain}/{stage}")

def get_session_id_for_connection(connection_id):
    """Get session ID associated with a connection"""
    try:
        response = connections_table.get_item(Key={'connectionId': connection_id})
        if 'Item' in response and 'sessionId' in response['Item']:
            return response['Item']['sessionId']
    except Exception as e:
        print(f"Error getting session for connection: {e}")
    return None

def create_session_for_connection(connection_id):
    """Create a new session and link it to the connection"""
    session_id = f"session_{datetime.now().timestamp()}"

    # Create session in sessions table
    session = {
        'sessionId': session_id,
        'connectionId': connection_id,
        'history': [],
        'state': 'MENU',
        'user_data': {},
        'created_at': datetime.now().isoformat()
    }
    save_session(session)

    # Link connection to session in connections table
    connections_table.put_item(Item={
        'connectionId': connection_id,
        'sessionId': session_id,
        'timestamp': datetime.now().isoformat()
    })

    print(f"Created session {session_id} for connection {connection_id}")
    return session_id

def get_session(session_id):
    """Retrieve session from DynamoDB"""
    try:
        response = sessions_table.get_item(Key={'sessionId': session_id})
        if 'Item' in response:
            return response['Item']
    except Exception as e:
        print(f"Error retrieving session: {e}")
    return None

def save_session(session):
    """Save session to DynamoDB"""
    try:
        session['updated_at'] = datetime.now().isoformat()
        sessions_table.put_item(Item=session)
    except Exception as e:
        print(f"Error saving session: {e}")

def delete_session(session_id):
    """Delete session from DynamoDB"""
    try:
        sessions_table.delete_item(Key={'sessionId': session_id})
        print(f"Deleted session: {session_id}")
    except Exception as e:
        print(f"Error deleting session: {e}")

def get_user_profile(asu_id):
    """Retrieve user profile from DynamoDB"""
    try:
        response = user_profiles_table.get_item(Key={'asuId': asu_id})
        if 'Item' in response:
            return response['Item']
    except Exception as e:
        print(f"Error retrieving user profile: {e}")
    return None

def save_user_profile(profile):
    """Save user profile to DynamoDB"""
    try:
        user_profiles_table.put_item(Item=profile)
    except Exception as e:
        print(f"Error saving user profile: {e}")

def get_menu_message():
    """Return main menu"""
    return """Welcome to ASU Student Loan Repayment Advisor! Please select an option:

1. Suggest best plans for maximum retirement savings
   Get a personalized optimization plan to clear student loans while building retirement savings

2. Ask questions based on my personal profile
   Get answers about your match earnings, payment history, and personalized recommendations

3. General information & FAQs
   Learn about employer match, SECURE 2.0, eligibility, and more

Reply with the number (1, 2, or 3) to continue."""

def get_llm_response(session_id, user_message, context=None):
    """Call LLM with enhanced context"""
    client = initialize_chatbot()
    client.cognito_auth.ensure_valid_token()
    cognito_jwt_token = client.cognito_auth.get_access_key()

    session = get_session(session_id)
    if not session:
        return "Session not found. Please start a new session."

    # Build system prompt based on context
    if context == 'OPTIMIZATION':
        system_prompt = """You are a financial optimization specialist for ASU's Student Loan Repayment Match Program.

Your task: Create a detailed, month-by-month plan that maximizes retirement savings while efficiently paying off student loans.

You MUST provide:
1. Exact monthly budget breakdown with dollar amounts
2. Loan payoff timeline with milestones
3. Retirement savings projections (with compound interest calculations)
4. Tax optimization strategies specific to the user's situation
5. Employer match utilization plan
6. Emergency fund recommendations
7. Concrete action steps with deadlines

Use the user's specific data to provide precise calculations, not generic advice."""

    elif context == 'PROFILE':
        system_prompt = """You are a personalized financial assistant for ASU employees with access to their profile data.

Provide specific, data-driven answers based on the user's actual:
- Student loan balance and payment history
- Employer match earnings and contributions
- Payment schedules and due dates
- Monthly caps and limits
- 401(k) contribution rates

Answer questions with exact numbers, dates, and personalized calculations. Be precise and actionable."""

    elif context == 'FAQ':
        system_prompt = """You are an expert on ASU's Student Loan Repayment Match Program and SECURE 2.0 legislation.

Provide clear, accurate information about:
- How employer match works (mechanics, eligibility, limits)
- SECURE 2.0 provisions and benefits
- Enrollment procedures and requirements
- Loan qualification criteria (federal vs private)
- Common troubleshooting issues
- Strategic financial planning advice

Be thorough but concise. Use examples when helpful."""

    else:
        system_prompt = """You are a helpful financial advisor for ASU's Student Loan Repayment Match Program."""

    # Add user profile context if available
    if session.get('user_data'):
        profile_context = "\n\nUSER PROFILE DATA:\n"
        for key, value in session['user_data'].items():
            profile_context += f"- {key}: {value}\n"
        system_prompt += profile_context

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history
    history = session.get('history', [])
    recent_history = history[-15:] if len(history) > 15 else history
    for msg in recent_history:
        messages.append(msg)

    messages.append({"role": "user", "content": user_message})

    # Call LLM
    headers = {
        "x-api-key": f"Bearer {os.environ['BEARER_TOKEN']}",
        "Authorization": f"Bearer {cognito_jwt_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "Anthropic Claude-V3.5 Sonnet Vertex AI (Internal)",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 3000
    }

    try:
        response = requests.post(
            "https://api-llm.ctl-gait.clientlabsaft.com/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            assistant_message = result['choices'][0]['message']['content']

            # Update session history
            session['history'].append({"role": "user", "content": user_message})
            session['history'].append({"role": "assistant", "content": assistant_message})
            save_session(session)

            return assistant_message
        else:
            raise Exception(f"API Error: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again."

def handle_message_flow(session_id, user_message, provided_user_data=None):
    """Handle conversational flow with optional pre-provided user data"""
    session = get_session(session_id)
    if not session:
        return "Session not found. Please reconnect to start a new session."

    state = session.get('state', 'MENU')
    user_data = session.get('user_data', {})

    # Merge provided user_data if available
    if provided_user_data:
        user_data.update(provided_user_data)
        session['user_data'] = user_data
        save_session(session)

    # Main menu selection
    if state == 'MENU':
        if user_message.strip() == '1':
            # Check if we have all required data
            required_fields = ['asu_id', 'debt_amount', 'repayment_period', 'interest_rate', 'salary']
            has_all_data = all(field in user_data for field in required_fields)

            if has_all_data:
                # Skip data collection, go straight to optimization
                session['state'] = 'OPT_COMPLETE'
                session['context'] = 'OPTIMIZATION'
                save_session(session)

                # Save profile
                save_user_profile({
                    'asuId': user_data['asu_id'],
                    'debtAmount': user_data['debt_amount'],
                    'repaymentPeriod': user_data['repayment_period'],
                    'interestRate': user_data['interest_rate'],
                    'salary': user_data['salary'],
                    'updated_at': datetime.now().isoformat()
                })

                # Generate plan immediately
                prompt = f"""Based on this employee's data, create a detailed month-by-month optimization plan:

ASU ID: {user_data['asu_id']}
Student Loan Debt: {user_data['debt_amount']}
Repayment Period: {user_data['repayment_period']}
Interest Rate: {user_data['interest_rate']}
Annual Salary: {user_data['salary']}

Provide:
1. Monthly budget breakdown
2. Loan payoff schedule
3. Retirement savings plan
4. Employer match strategy
5. Tax optimization tips
6. Specific action steps"""

                return get_llm_response(session_id, prompt, 'OPTIMIZATION')
            else:
                # Start collecting missing data
                session['state'] = 'OPT_ASU_ID'
                session['context'] = 'OPTIMIZATION'
                save_session(session)
                return "Great! Let's create your personalized retirement optimization plan.\n\nFirst, please provide your ASU ID:"

        elif user_message.strip() == '2':
            # Check if ASU ID is provided
            if 'asu_id' in user_data:
                # Fetch profile from DynamoDB
                profile = get_user_profile(user_data['asu_id'])

                if profile:
                    session['user_data'].update({
                        'debt_amount': profile.get('debtAmount', 'N/A'),
                        'salary': profile.get('salary', 'N/A'),
                        'repayment_period': profile.get('repaymentPeriod', 'N/A'),
                        'interest_rate': profile.get('interestRate', 'N/A')
                    })
                    session['state'] = 'PROFILE_QUESTIONS'
                    session['context'] = 'PROFILE'
                    save_session(session)
                    return f"""Found your profile!
- ASU ID: {user_data['asu_id']}
- Debt Amount: {profile.get('debtAmount')}
- Salary: {profile.get('salary')}
- Interest Rate: {profile.get('interestRate')}

What would you like to know? You can ask:
- How much match have I earned this year?
- When is my next payment due?
- Should I pay extra or invest more in 401(k)?
- What's the fastest way to pay off my debt?"""
                else:
                    # Profile not found, collect data
                    session['state'] = 'PROFILE_COLLECT_DEBT'
                    session['context'] = 'PROFILE'
                    save_session(session)
                    return f"I don't have a profile for ASU ID: {user_data['asu_id']}. Let's create one.\n\nWhat is your total student loan debt?"
            else:
                session['state'] = 'PROFILE_ASU_ID'
                session['context'] = 'PROFILE'
                save_session(session)
                return "I'll help answer questions based on your profile.\n\nPlease provide your ASU ID:"

        elif user_message.strip() == '3':
            session['state'] = 'FAQ'
            session['context'] = 'FAQ'
            save_session(session)
            return get_llm_response(session_id, "Provide a brief overview of ASU's Student Loan Repayment Match Program and SECURE 2.0, then ask what specific information the user wants to know.", 'FAQ')

        else:
            return get_menu_message()

    # Optimization flow - collect data step by step
    elif state == 'OPT_ASU_ID':
        user_data['asu_id'] = user_message.strip()
        session['state'] = 'OPT_DEBT_AMOUNT'
        session['user_data'] = user_data
        save_session(session)
        return "What is your total student loan debt amount? (e.g., $50,000)"

    elif state == 'OPT_DEBT_AMOUNT':
        user_data['debt_amount'] = user_message.strip()
        session['state'] = 'OPT_REPAY_PERIOD'
        session['user_data'] = user_data
        save_session(session)
        return "How many years do you have to repay your loans? (e.g., 10 years)"

    elif state == 'OPT_REPAY_PERIOD':
        user_data['repayment_period'] = user_message.strip()
        session['state'] = 'OPT_INTEREST_RATE'
        session['user_data'] = user_data
        save_session(session)
        return "What is your interest rate on the loan? (e.g., 5.5%)"

    elif state == 'OPT_INTEREST_RATE':
        user_data['interest_rate'] = user_message.strip()
        session['state'] = 'OPT_SALARY'
        session['user_data'] = user_data
        save_session(session)
        return "What is your annual salary? (e.g., $65,000)"

    elif state == 'OPT_SALARY':
        user_data['salary'] = user_message.strip()
        session['state'] = 'OPT_COMPLETE'
        session['user_data'] = user_data
        save_session(session)

        # Save profile to DynamoDB
        save_user_profile({
            'asuId': user_data['asu_id'],
            'debtAmount': user_data['debt_amount'],
            'repaymentPeriod': user_data['repayment_period'],
            'interestRate': user_data['interest_rate'],
            'salary': user_data['salary'],
            'created_at': datetime.now().isoformat()
        })

        # Generate comprehensive plan
        prompt = f"""Based on this employee's data, create a detailed optimization plan:

ASU ID: {user_data['asu_id']}
Student Loan Debt: {user_data['debt_amount']}
Repayment Period: {user_data['repayment_period']}
Interest Rate: {user_data['interest_rate']}
Annual Salary: {user_data['salary']}

Provide specific monthly budget and timeline."""

        return get_llm_response(session_id, prompt, 'OPTIMIZATION')

    # Profile-based questions flow
    elif state == 'PROFILE_ASU_ID':
        asu_id = user_message.strip()
        profile = get_user_profile(asu_id)

        if profile:
            session['user_data'] = {
                'asu_id': profile['asuId'],
                'debt_amount': profile.get('debtAmount'),
                'salary': profile.get('salary'),
                'repayment_period': profile.get('repaymentPeriod'),
                'interest_rate': profile.get('interestRate')
            }
            session['state'] = 'PROFILE_QUESTIONS'
            save_session(session)
            return f"""Found your profile! Here's what I have:
- Debt Amount: {profile.get('debtAmount')}
- Salary: {profile.get('salary')}

What would you like to know?"""

        else:
            session['state'] = 'PROFILE_COLLECT_DEBT'
            session['user_data'] = {'asu_id': asu_id}
            save_session(session)
            return "I don't have a profile for this ASU ID. Let's create one.\n\nWhat is your total student loan debt?"

    elif state == 'PROFILE_COLLECT_DEBT':
        user_data['debt_amount'] = user_message.strip()
        session['state'] = 'PROFILE_COLLECT_PERIOD'
        session['user_data'] = user_data
        save_session(session)
        return "How many years do you have to repay?"

    elif state == 'PROFILE_COLLECT_PERIOD':
        user_data['repayment_period'] = user_message.strip()
        session['state'] = 'PROFILE_COLLECT_RATE'
        session['user_data'] = user_data
        save_session(session)
        return "What is your interest rate?"

    elif state == 'PROFILE_COLLECT_RATE':
        user_data['interest_rate'] = user_message.strip()
        session['state'] = 'PROFILE_COLLECT_SALARY'
        session['user_data'] = user_data
        save_session(session)
        return "What is your annual salary?"

    elif state == 'PROFILE_COLLECT_SALARY':
        user_data['salary'] = user_message.strip()
        session['state'] = 'PROFILE_QUESTIONS'
        session['user_data'] = user_data
        save_session(session)

        # Save new profile
        save_user_profile({
            'asuId': user_data['asu_id'],
            'debtAmount': user_data['debt_amount'],
            'repaymentPeriod': user_data['repayment_period'],
            'interestRate': user_data['interest_rate'],
            'salary': user_data['salary'],
            'created_at': datetime.now().isoformat()
        })

        return "Profile created! What would you like to know?"

    elif state == 'PROFILE_QUESTIONS':
        return get_llm_response(session_id, user_message, 'PROFILE')

    elif state == 'FAQ':
        return get_llm_response(session_id, user_message, 'FAQ')

    elif state == 'OPT_COMPLETE':
        return get_llm_response(session_id, user_message, 'OPTIMIZATION')

    else:
        return get_menu_message()


def lambda_handler(event, context):
    """Main Lambda handler for WebSocket events"""

    print(f"Event: {json.dumps(event)}")

    route_key = event['requestContext']['routeKey']
    connection_id = event['requestContext']['connectionId']

    print(f"Route: {route_key}, Connection: {connection_id}")

    try:
        if route_key == '$connect':
            # Connection established - don't create session yet, wait for 'start' action
            connections_table.put_item(Item={
                'connectionId': connection_id,
                'timestamp': datetime.now().isoformat()
            })
            print(f"Connection stored: {connection_id}")
            return {'statusCode': 200}

        elif route_key == '$disconnect':
            # Clean up connection and associated session
            session_id = get_session_id_for_connection(connection_id)

            if session_id:
                delete_session(session_id)

            connections_table.delete_item(Key={'connectionId': connection_id})
            print(f"Connection and session cleaned up: {connection_id}")
            return {'statusCode': 200}

        elif route_key in ['$default', 'message']:
            # Handle message
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')

            print(f"Action: {action}")

            apigw_client = get_apigw_client(event)

            if action == 'start':
                # Create new session for this connection
                session_id = create_session_for_connection(connection_id)

                response_data = {
                    'type': 'session_started',
                    'session_id': session_id,
                    'message': get_menu_message()
                }

                apigw_client.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(response_data).encode('utf-8')
                )

                print(f"Session started: {session_id}")

            elif action == 'message':
                # Get session ID from connection
                session_id = get_session_id_for_connection(connection_id)

                if not session_id:
                    error_response = {
                        'type': 'error',
                        'message': 'No active session. Please send {"action": "start"} first.'
                    }
                    apigw_client.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(error_response).encode('utf-8')
                    )
                    return {'statusCode': 400}

                user_message = body.get('message')
                provided_user_data = body.get('user_data')

                print(f"Processing message for session {session_id}")

                # Handle message based on flow
                assistant_response = handle_message_flow(session_id, user_message, provided_user_data)

                response_data = {
                    'type': 'response',
                    'message': assistant_response,
                    'timestamp': datetime.now().isoformat()
                }

                apigw_client.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(response_data).encode('utf-8')
                )

            return {'statusCode': 200}

        else:
            print(f"Unknown route: {route_key}")
            return {'statusCode': 400, 'body': 'Unknown route'}

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'statusCode': 500, 'body': str(e)}
