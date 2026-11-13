
import json
import os
import uuid
from datetime import datetime, timezone

from decimal import Decimal

import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

BUCKET_NAME = os.environ["QUESTION_BUCKET"]
TABLE_NAME = os.environ["RESULTS_TABLE"]

results_table = dynamodb.Table(TABLE_NAME)


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }


def normalize_answers(answers):
    """Normalize selected answer IDs for exact-match scoring."""
    if isinstance(answers, str):
        answers = [answers]

    if not isinstance(answers, list):
        return []

    return sorted(set(str(answer) for answer in answers))


def lambda_handler(event, context):
    try:
        # Read submitted answers from API Gateway request.
        body = event.get("body")

        if isinstance(body, str):
            body = json.loads(body)
        elif body is None:
            body = {}

        submitted_answers = body.get("answers", {})

        if not isinstance(submitted_answers, dict):
            return response(400, {
                "message": "Answers must be an object."
            })

        # Retrieve the private answer key from S3.
        s3_response = s3.get_object(
            Bucket=BUCKET_NAME,
            Key="clf-c02-questions.json"
        )

        questions = json.loads(
            s3_response["Body"].read().decode("utf-8")
        )

        if not questions:
            return response(500, {
                "message": "Question bank is empty."
            })

        correct_count = 0
        incorrect_count = 0
        unanswered_count = 0
        review = []
        domain_scores = {}

        for question in questions:
            question_id = str(question["id"])
            domain = question["domain"]

            correct_answers = normalize_answers(
                question["correctAnswers"]
            )

            selected_answers = normalize_answers(
                submitted_answers.get(question_id, [])
            )

            is_correct = (
                selected_answers == correct_answers
            )

            if not selected_answers:
                unanswered_count += 1
            elif is_correct:
                correct_count += 1
            else:
                incorrect_count += 1

            if domain not in domain_scores:
                domain_scores[domain] = {
                    "total": 0,
                    "correct": 0
                }

            domain_scores[domain]["total"] += 1

            if is_correct:
                domain_scores[domain]["correct"] += 1

            review.append({
                "id": question["id"],
                "domain": domain,
                "type": question["type"],
                "question": question["question"],
                "options": question["options"],
                "selectedAnswers": selected_answers,
                "correctAnswers": correct_answers,
                "isCorrect": is_correct,
                "explanation": question.get(
                    "explanation", ""
                )
            })

        total_questions = len(questions)
        percentage = round(
            (correct_count / total_questions) * 100, 2
        )

        attempt_id = str(uuid.uuid4())
        submitted_at = datetime.now(
            timezone.utc
        ).isoformat()

        result = {
            "attemptId": attempt_id,
            "totalQuestions": total_questions,
            "correctAnswers": correct_count,
            "incorrectAnswers": incorrect_count,
            "unanswered": unanswered_count,
            "percentage": percentage,
            "practiceBenchmark": 70,
            "benchmarkMet": percentage >= 70,
            "domainScores": domain_scores,
            "review": review,
            "submittedAt": submitted_at
        }

        # Persist the result in DynamoDB.
        results_table.put_item(
            Item={
                "attemptId": attempt_id,
                "submittedAt": submitted_at,
                "totalQuestions": total_questions,
                "correctAnswers": correct_count,
                "incorrectAnswers": incorrect_count,
                "unanswered": unanswered_count,
                "percentage": Decimal(str(percentage)),
                "benchmarkMet": percentage >= 70
            }
        )

        return response(200, result)

    except Exception as error:
        print(f"Submission error: {error}")

        return response(500, {
            "message": "Unable to evaluate exam submission."
        })
