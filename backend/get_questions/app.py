
import json
import os
import boto3

s3 = boto3.client("s3")

BUCKET_NAME = os.environ.get("QUESTION_BUCKET")
QUESTION_FILE = "clf-c02-questions.json"


def lambda_handler(event, context):
    try:
        response = s3.get_object(
            Bucket=BUCKET_NAME,
            Key=QUESTION_FILE
        )

        questions = json.loads(
            response["Body"].read().decode("utf-8")
        )

        # Never send correct answers or explanations to the browser.
        public_questions = []

        for question in questions:
            public_questions.append({
                "id": question["id"],
                "domain": question["domain"],
                "type": question["type"],
                "question": question["question"],
                "options": question["options"]
            })

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(public_questions)
        }

    except Exception as error:
        print(f"Error retrieving questions: {error}")

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "message": "Unable to retrieve questions"
            })
        }
