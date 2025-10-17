import boto3
import json
import os
from datetime import datetime
import uuid

s3_client = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']
UPLOAD_EXPIRATION = int(os.environ.get('UPLOAD_EXPIRATION', '300'))

def lambda_handler(event, context):
    print("Generating pre-signed URLs with ASU ID organization")

    try:
        # Parse request
        if "body" in event:
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        else:
            body = event

        # Get ASU ID from request
        asu_id = body.get("asuId")
        if not asu_id:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "asuId is required"})
            }

        # Validate ASU ID format (10 digits)
        if not asu_id.isdigit() or len(asu_id) != 10:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Invalid asuId format. Must be 10 digits."})
            }

        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')

        # S3 keys with ASU ID folder structure
        loan_key = f"{asu_id}/loan-{timestamp}.pdf"
        salary_key = f"{asu_id}/salary-{timestamp}.pdf"

        # Generate pre-signed URLs
        loan_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': loan_key,
                'ContentType': 'application/pdf',
                'ServerSideEncryption': 'AES256'
            },
            ExpiresIn=UPLOAD_EXPIRATION,
            HttpMethod='PUT'
        )

        salary_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': salary_key,
                'ContentType': 'application/pdf',
                'ServerSideEncryption': 'AES256'
            },
            ExpiresIn=UPLOAD_EXPIRATION,
            HttpMethod='PUT'
        )

        print(f"Generated URLs for ASU ID: {asu_id}")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "asuId": asu_id,
                "loanDocument": {
                    "uploadUrl": loan_url,
                    "fileKey": loan_key
                },
                "salarySlips": {
                    "uploadUrl": salary_url,
                    "fileKey": salary_key
                },
                "bucket": BUCKET_NAME,
                "expiresIn": UPLOAD_EXPIRATION
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }