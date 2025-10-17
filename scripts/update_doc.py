import boto3
from botocore.exceptions import ClientError
from datetime import datetime

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = 'asu-user-profiles'
table = dynamodb.Table(table_name)

def update_approval_status():
    """
    Scan the table and update approvalStatus from 'pending' to 'action_required'
    for records where asuId starts with 'ASU'
    """
    try:
        # Scan the table with filter
        response = table.scan(
            FilterExpression='approvalStatus = :status AND begins_with(asuId, :prefix)',
            ExpressionAttributeValues={
                ':status': 'pending',
                ':prefix': 'ASU'
            }
        )

        items = response.get('Items', [])
        updated_count = 0

        print(f"Found {len(items)} records to update")

        # Update each matching record
        for item in items:
            asu_id = item['asuId']

            try:
                # Update the record
                update_response = table.update_item(
                    Key={'asuId': asu_id},
                    UpdateExpression='SET approvalStatus = :new_status, updatedAt = :timestamp',
                    ExpressionAttributeValues={
                        ':new_status': 'action_required',
                        ':timestamp': datetime.utcnow().isoformat(),
                        ':old_status': 'pending'
                    },
                    ConditionExpression='approvalStatus = :old_status',
                    ReturnValues='UPDATED_NEW'
                )

                updated_count += 1
                print(f"✓ Updated {asu_id}: approvalStatus changed to 'action_required'")

            except ClientError as e:
                if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                    print(f"✗ Skipped {asu_id}: Status already changed")
                else:
                    print(f"✗ Error updating {asu_id}: {str(e)}")

        # Handle pagination if there are more items
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression='approvalStatus = :status AND begins_with(asuId, :prefix)',
                ExpressionAttributeValues={
                    ':status': 'pending',
                    ':prefix': 'ASU'
                },
                ExclusiveStartKey=response['LastEvaluatedKey']
            )

            items = response.get('Items', [])

            for item in items:
                asu_id = item['asuId']

                try:
                    update_response = table.update_item(
                        Key={'asuId': asu_id},
                        UpdateExpression='SET approvalStatus = :new_status, updatedAt = :timestamp',
                        ExpressionAttributeValues={
                            ':new_status': 'action_required',
                            ':timestamp': datetime.utcnow().isoformat(),
                            ':old_status': 'pending'
                        },
                        ConditionExpression='approvalStatus = :old_status',
                        ReturnValues='UPDATED_NEW'
                    )

                    updated_count += 1
                    print(f"✓ Updated {asu_id}: approvalStatus changed to 'action_required'")

                except ClientError as e:
                    if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                        print(f"✗ Skipped {asu_id}: Status already changed")
                    else:
                        print(f"✗ Error updating {asu_id}: {str(e)}")

        print(f"\n=== Update Complete ===")
        print(f"Total records updated: {updated_count}")

    except ClientError as e:
        print(f"Error scanning table: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    print("Starting approval status update...")
    print("=" * 50)
    success = update_approval_status()

    if success:
        print("\nScript completed successfully!")
    else:
        print("\nScript completed with errors.")