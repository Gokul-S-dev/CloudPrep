/**
 * CloudPrep AWS Serverless API Service
 * Centralized service layer for Amazon API Gateway endpoints:
 * - GET  /questions : Retrieve CLF-C02 question bank without answers/explanations
 * - POST /submit    : Submit user answers, evaluate score via Lambda, store in DynamoDB
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://fbp9d6e1b1.execute-api.ap-south-1.amazonaws.com'
).replace(/\/+$/, '');

/**
 * Fetch the public question bank for the CLF-C02 mock exam.
 * Note: Correct answers and explanations are not exposed in this response.
 * @returns {Promise<Array>} Array of question objects
 */
export async function getQuestions() {
  const url = `${API_BASE_URL}/questions`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response structure: expected an array of questions.');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the AWS API Gateway. Please check your internet connection.', {
        cause: error
      });
    }
    throw error;
  }
}

/**
 * Submit candidate answers to the backend for scoring and persistence.
 * @param {Object} answers Map of question ID to array of selected option IDs, e.g. { "1": ["B"], "4": ["A", "C"] }
 * @returns {Promise<Object>} Backend scoring result and answer review payload
 */
export async function submitExam(answers) {
  const url = `${API_BASE_URL}/submit`;

  // Format answers with string keys and array values
  const formattedAnswers = {};
  if (answers && typeof answers === 'object') {
    Object.entries(answers).forEach(([key, val]) => {
      formattedAnswers[String(key)] = Array.isArray(val) ? val : [val];
    });
  }

  const payload = {
    answers: formattedAnswers
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    if (!data) {
      throw new Error('Received empty response from the server.');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to submit your exam to the AWS backend. Please try again.', {
        cause: error
      });
    }
    throw error;
  }
}

export default {
  getQuestions,
  submitExam
};
