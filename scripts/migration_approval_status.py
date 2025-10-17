import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('asu-user-profiles')

def migrate_add_approval_status():
    """Add approvalStatus field to all users"""

    print("="*80)
    print("MIGRATION: Adding approvalStatus field to all users")
    print("="*80)

    # Scan all users
    print("\nScanning all users...")
    all_users = []
    last_key = None

    while True:
        if last_key:
            response = table.scan(ExclusiveStartKey=last_key)
        else:
            response = table.scan()

        all_users.extend(response.get('Items', []))
        last_key = response.get('LastEvaluatedKey')
        if not last_key:
            break

    print(f"Found {len(all_users)} users\n")

    # Update each user
    success_count = 0
    error_count = 0

    for i, user in enumerate(all_users):
        try:
            asu_id = user['asuId']

            # Check if approvalStatus already exists
            if 'approvalStatus' in user:
                print(f"{i+1}/{len(all_users)}: {asu_id} already has approvalStatus")
            else:
                # Add approvalStatus = "pending"
                table.update_item(
                    Key={'asuId': asu_id},
                    UpdateExpression='SET approvalStatus = :status, updatedAt = :time',
                    ExpressionAttributeValues={
                        ':status': 'pending',
                        ':time': datetime.utcnow().isoformat()
                    }
                )
                print(f"{i+1}/{len(all_users)}: Added approvalStatus to {asu_id}")
                success_count += 1

        except Exception as e:
            print(f"{i+1}/{len(all_users)}: ERROR updating {asu_id}: {str(e)}")
            error_count += 1

    print("\n" + "="*80)
    print("MIGRATION COMPLETE")
    print("="*80)
    print(f"Success: {success_count}")
    print(f"Errors: {error_count}")
    print(f"Already had field: {len(all_users) - success_count - error_count}")
    print("="*80)

if __name__ == '__main__':
    migrate_add_approval_status()
