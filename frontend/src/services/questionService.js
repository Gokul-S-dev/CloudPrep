import referenceQuestions from '../data/clf-c02-questions.json';

const QUESTIONS_STORAGE_KEY = 'cloudprep_demo_admin_questions';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSeedQuestions() {
  return referenceQuestions.map((q) => ({
    ...q,
    certification: 'AWS Certified Cloud Practitioner',
    examCode: 'CLF-C02',
    mockTestId: 'clf-c02-live',
    difficulty: q.type === 'multiple' ? 'Intermediate' : 'Foundational',
    status: 'Published'
  }));
}

function loadAdminQuestions() {
  try {
    const raw = window.localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return getSeedQuestions();
}

function saveAdminQuestions(questions) {
  try {
    window.localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
}

/**
 * Validate a single question object according to CloudPrep specification
 */
export function validateQuestion(q) {
  const errors = [];

  if (!q.question || !String(q.question).trim()) {
    errors.push('Question text cannot be empty.');
  }

  if (!q.domain || !String(q.domain).trim()) {
    errors.push('Exam domain is required.');
  }

  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push('At least two answer options are required.');
  } else {
    const emptyOption = q.options.find((opt) => !opt.text || !String(opt.text).trim());
    if (emptyOption) {
      errors.push(`Option ${emptyOption.id || ''} text cannot be empty.`);
    }
  }

  const availableIds = new Set((q.options || []).map((o) => o.id));
  const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];

  if (q.type === 'single') {
    if (correctAnswers.length !== 1) {
      errors.push('Single-choice questions must have exactly one correct answer.');
    }
  } else if (q.type === 'multiple') {
    if (correctAnswers.length < 2) {
      errors.push('Multiple-response questions must have at least two correct answers.');
    }
  } else {
    errors.push('Question type must be either "single" or "multiple".');
  }

  const invalidCorrect = correctAnswers.filter((ansId) => !availableIds.has(ansId));
  if (invalidCorrect.length > 0) {
    errors.push(`Correct answer(s) [${invalidCorrect.join(', ')}] do not match available option IDs.`);
  }

  return errors;
}

/**
 * Validate an array of bulk-imported JSON questions
 */
export function validateBulkImport(jsonArray) {
  if (!Array.isArray(jsonArray)) {
    return {
      valid: false,
      validQuestions: [],
      errors: [{ questionId: 'Root', messages: ['JSON root must be an array of question objects.'] }]
    };
  }

  if (jsonArray.length === 0) {
    return {
      valid: false,
      validQuestions: [],
      errors: [{ questionId: 'Root', messages: ['Imported JSON array is empty.'] }]
    };
  }

  const validQuestions = [];
  const errors = [];

  jsonArray.forEach((item, index) => {
    const qId = item?.id ?? `Index #${index + 1}`;
    const itemErrors = validateQuestion(item || {});
    if (itemErrors.length > 0) {
      errors.push({ questionId: qId, messages: itemErrors });
    } else {
      validQuestions.push({
        id: item.id ?? Date.now() + index,
        domain: item.domain.trim(),
        type: item.type,
        question: item.question.trim(),
        options: item.options.map((o) => ({ id: String(o.id), text: String(o.text).trim() })),
        correctAnswers: [...item.correctAnswers],
        explanation: item.explanation ? String(item.explanation).trim() : '',
        certification: item.certification || 'AWS Certified Cloud Practitioner',
        examCode: item.examCode || 'CLF-C02',
        mockTestId: item.mockTestId || 'clf-c02-live',
        difficulty: item.difficulty || 'Foundational',
        status: item.status || 'Published'
      });
    }
  });

  return {
    valid: errors.length === 0,
    validQuestions,
    errors
  };
}

export async function getAdminQuestions() {
  await delay(200);
  return loadAdminQuestions();
}

export async function createAdminQuestion(questionData) {
  await delay(250);
  const errors = validateQuestion(questionData);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const questions = loadAdminQuestions();
  const maxId = questions.reduce((max, q) => (typeof q.id === 'number' && q.id > max ? q.id : max), 0);
  const newQuestion = {
    ...questionData,
    id: maxId + 1,
    status: questionData.status || 'Published'
  };
  const updated = [newQuestion, ...questions];
  saveAdminQuestions(updated);
  return newQuestion;
}

export async function updateAdminQuestion(id, updates) {
  await delay(250);
  const errors = validateQuestion(updates);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const questions = loadAdminQuestions();
  const idx = questions.findIndex((q) => String(q.id) === String(id));
  if (idx === -1) {
    throw new Error('Question not found.');
  }
  questions[idx] = { ...questions[idx], ...updates };
  saveAdminQuestions(questions);
  return questions[idx];
}

export async function deleteAdminQuestion(id) {
  await delay(200);
  const questions = loadAdminQuestions();
  const filtered = questions.filter((q) => String(q.id) !== String(id));
  saveAdminQuestions(filtered);
  return { deleted: true, id };
}

export async function bulkImportQuestions(validQuestions, { mode = 'append', mockTestId, certification, examCode } = {}) {
  await delay(300);
  const existing = mode === 'replace' ? [] : loadAdminQuestions();
  let nextId = existing.reduce((max, q) => (typeof q.id === 'number' && q.id > max ? q.id : max), 0) + 1;

  const prepared = validQuestions.map((q) => ({
    ...q,
    id: nextId++,
    mockTestId: mockTestId || q.mockTestId || 'clf-c02-live',
    certification: certification || q.certification || 'AWS Certified Cloud Practitioner',
    examCode: examCode || q.examCode || 'CLF-C02'
  }));

  const combined = [...prepared, ...existing];
  saveAdminQuestions(combined);
  return { importedCount: prepared.length, totalCount: combined.length };
}

