import boto3
import json
import os
from datetime import datetime
from decimal import Decimal
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate
import re

try:
    from complete_auto_refresh_auth import create_client
except ImportError:
    create_client = None

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
secrets_client = boto3.client("secretsmanager")

BUCKET_NAME = os.environ["BUCKET_NAME"]
SECRET_ARN = os.environ["SECRET_ARN"]
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "asu-user-profiles")

table = dynamodb.Table(DYNAMODB_TABLE)

auth_client = None
embeddings = None
llm = None
credentials_cache = None


def convert_to_decimal(obj):
    """Convert floats to Decimal for DynamoDB"""
    if isinstance(obj, dict):
        return {k: convert_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_decimal(v) for v in obj]
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj


def get_credentials():
    global credentials_cache
    if credentials_cache is None:
        response = secrets_client.get_secret_value(SecretId=SECRET_ARN)
        credentials_cache = json.loads(response["SecretString"])
    return credentials_cache


def initialize_auth():
    global auth_client, embeddings, llm
    creds = get_credentials()

    LITELLM_ENDPOINT = creds["litellm_endpoint"]
    BEARER_TOKEN = creds["bearer_token"]
    USERNAME = creds.get("cognito_username")
    PASSWORD = creds.get("cognito_password")

    MODEL = os.environ.get("LLM_MODEL", "Anthropic Claude-V3.5 Sonnet Vertex AI (Internal)")
    EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "Azure OpenAI Text Embedding 3 Large (External)")

    if auth_client is None and create_client is not None:
        auth_client = create_client(username=USERNAME, password=PASSWORD, bearer_token=BEARER_TOKEN)

    cognito_jwt = auth_client.cognito_auth.get_access_key() if auth_client else BEARER_TOKEN

    if embeddings is None:
        embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            openai_api_base=LITELLM_ENDPOINT,
            openai_api_key=BEARER_TOKEN,
            default_headers={
                "x-api-key": f"Bearer {BEARER_TOKEN}",
                "Authorization": f"Bearer {cognito_jwt}",
            },
        )

    if llm is None:
        llm = ChatOpenAI(
            openai_api_base=LITELLM_ENDPOINT,
            model=MODEL,
            temperature=0,
            api_key=BEARER_TOKEN,
            default_headers={
                "x-api-key": f"Bearer {BEARER_TOKEN}",
                "Authorization": f"Bearer {cognito_jwt}",
            },
        )

    return embeddings, llm


def clean_json_response(text):
    """Extract JSON from LLM response"""
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = re.sub(r'^.*?(?=\{)', '', text, flags=re.DOTALL)
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        return json_match.group(0)
    return text


def extract_with_rag(pdf_path, extraction_query):
    embed, llm_instance = initialize_auth()

    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)
    chunks = text_splitter.split_documents(docs)

    vectorstore = FAISS.from_documents(chunks, embedding=embed)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    prompt = ChatPromptTemplate.from_template(
        "Extract information from the document.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Return ONLY a valid JSON object. No explanations, no markdown."
    )

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm_instance
        | StrOutputParser()
    )

    result = rag_chain.invoke(extraction_query)
    return result


def lambda_handler(event, context):
    print("=" * 80)
    print("LOAN APPLICATION PROCESSOR")
    print("=" * 80)

    start_time = datetime.utcnow()
    tmp_files = []

    try:
        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event
        bucket = body.get("bucket", BUCKET_NAME)
        loan_key = body.get("loanDocKey")
        salary_key = body.get("salarySlipsKey")
        asu_id = body.get("asuId")

        if not (loan_key and salary_key and asu_id):
            raise ValueError("Missing required: asuId, loanDocKey, salarySlipsKey")

        # Download documents
        loan_path = f"/tmp/{os.path.basename(loan_key)}"
        salary_path = f"/tmp/{os.path.basename(salary_key)}"
        s3_client.download_file(bucket, loan_key, loan_path)
        s3_client.download_file(bucket, salary_key, salary_path)
        tmp_files = [loan_path, salary_path]

        print(f"Processing for ASU ID: {asu_id}")

        # Extraction queries
        loan_query = """Extract loan information as JSON:
        {"loanProvider":"bank name","applicantName":"full name","sanctionedAmount":number,"loanAmount":number,
        "currency":"INR/USD/EUR","interestRate":number,"loanTenure":number,"loanType":"type",
        "applicationDate":"YYYY-MM-DD","disbursementDate":"YYYY-MM-DD"}"""

        salary_query = """Extract salary information as JSON:
        {"employerName":"company","employeeName":"name","month":"month year","grossSalary":number,
        "deductions":number,"netSalary":number,"currency":"USD/INR","averageSalary3Months":number,
        "employmentDuration":"text"}"""

        # Extract data
        loan_result = extract_with_rag(loan_path, loan_query)
        salary_result = extract_with_rag(salary_path, salary_query)

        loan_data = json.loads(clean_json_response(loan_result))
        salary_data = json.loads(clean_json_response(salary_result))

        # Name fields
        applicant_name = loan_data.get("applicantName", "")
        first_name = applicant_name.split()[0] if applicant_name else ""
        last_name = " ".join(applicant_name.split()[1:]) if len(applicant_name.split()) > 1 else ""

        # Check if user exists
        try:
            existing_user = table.get_item(Key={"asuId": asu_id})
            user_exists = "Item" in existing_user
            existing_item = existing_user.get("Item", {})
        except Exception as e:
            print(f"Error fetching user: {e}")
            user_exists = False
            existing_item = {}

        current_timestamp = datetime.utcnow().isoformat()

        # Generate pre-signed URLs
        loan_doc_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": loan_key},
            ExpiresIn=604800,
        )
        salary_doc_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": salary_key},
            ExpiresIn=604800,
        )

        # Common updated data
        update_fields = {
            "updatedAt": current_timestamp,
            "debtAmount": convert_to_decimal(loan_data.get("loanAmount") or loan_data.get("sanctionedAmount")),
            "interestRate": convert_to_decimal(loan_data.get("interestRate")),
            "repaymentPeriod": convert_to_decimal((loan_data.get("loanTenure") or 0) / 12 ),
            "salary": convert_to_decimal(salary_data.get("netSalary") or salary_data.get("grossSalary")),
            "loanApplication": convert_to_decimal(loan_data),
            "salaryVerification": convert_to_decimal(salary_data),
            "documents": {
                "loanDocKey": loan_key,
                "salaryDocKey": salary_key,
                "bucket": bucket,
                "loanDocUrl": loan_doc_url,
                "salaryDocUrl": salary_doc_url,
                "uploadedAt": current_timestamp,
            },
        }

        if not user_exists:
            # --- CREATE NEW USER ---
            new_item = {
                "asuId": asu_id,
                "firstName": first_name,
                "lastName": last_name,
                "asuEmail": f"{asu_id}@asu.edu",
                "approvalStatus": "pending",
                "createdAt": current_timestamp,
                "created_at": current_timestamp,
            }
            new_item.update(update_fields)
            table.put_item(Item=convert_to_decimal(new_item))
            action = "created"
        else:
            # --- UPDATE EXISTING USER (no overwrite of existing fields) ---
            update_expression = "SET #approvalStatus = :status, "
            expression_attribute_values = {":status": "pending"}
            expression_attribute_names = {"#approvalStatus": "approvalStatus"}


            # Dynamically add only new fields to update
            for k, v in update_fields.items():
                update_expression += f"#{k} = :{k}, "
                expression_attribute_names[f"#{k}"] = k
                expression_attribute_values[f":{k}"] = v

            update_expression = update_expression.rstrip(", ")

            table.update_item(
                Key={"asuId": asu_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
            )
            action = "updated"

        print(f"User {asu_id} {action} successfully.")

        processing_time = (datetime.utcnow() - start_time).total_seconds()
        response_data = {
            "asuId": asu_id,
            "status": "success",
            "action": action,
            "processingTime": processing_time,
            "loanApplication": loan_data,
            "salaryVerification": salary_data,
            "documents": {
                "loanDocUrl": loan_doc_url,
                "salaryDocUrl": salary_doc_url,
            },
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response_data),
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)}),
        }

    finally:
        for f in tmp_files:
            if os.path.exists(f):
                os.remove(f)