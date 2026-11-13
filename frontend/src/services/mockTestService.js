import { DEMO_CERTIFICATIONS, DEMO_MOCK_TESTS } from './mockData';

const MOCK_TESTS_STORAGE_KEY = 'cloudprep_demo_mock_tests';
const CERTIFICATIONS_STORAGE_KEY = 'cloudprep_demo_certifications';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadTestsFromStorage() {
  try {
    const raw = window.localStorage.getItem(MOCK_TESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [...DEMO_MOCK_TESTS];
}

function saveTestsToStorage(tests) {
  try {
    window.localStorage.setItem(MOCK_TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch {
    // ignore storage errors
  }
}

function loadCertificationsFromStorage() {
  try {
    const raw = window.localStorage.getItem(CERTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...DEMO_CERTIFICATIONS];
}

export async function getCertifications() {
  await delay(150);
  return loadCertificationsFromStorage();
}

export async function getMockTests({ includeDrafts = true } = {}) {
  await delay(200);
  const tests = loadTestsFromStorage();
  if (includeDrafts) return tests;
  return tests.filter((t) => t.status === 'Published');
}

export async function getMockTestById(id) {
  await delay(150);
  const tests = loadTestsFromStorage();
  return tests.find((t) => t.id === id) || null;
}

export async function createMockTest(testData) {
  await delay(300);
  const tests = loadTestsFromStorage();
  const newTest = {
    id: `${(testData.examCode || 'exam').toLowerCase()}-${Date.now()}`,
    title: testData.title.trim(),
    certification: testData.certification,
    examCode: testData.examCode,
    description: testData.description.trim(),
    durationMinutes: Number(testData.durationMinutes) || 90,
    totalQuestions: Number(testData.totalQuestions) || 65,
    passingBenchmark: Number(testData.passingBenchmark) || 70,
    difficulty: testData.difficulty || 'Foundational',
    status: testData.status || 'Draft',
    usesLiveApi: Boolean(testData.usesLiveApi),
    attemptsCount: 0,
    createdAt: new Date().toISOString()
  };
  const updated = [newTest, ...tests];
  saveTestsToStorage(updated);
  return newTest;
}

export async function updateMockTest(id, updates) {
  await delay(300);
  const tests = loadTestsFromStorage();
  const index = tests.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Mock test not found.');
  }
  const updatedTest = {
    ...tests[index],
    ...updates,
    durationMinutes: Number(updates.durationMinutes ?? tests[index].durationMinutes),
    totalQuestions: Number(updates.totalQuestions ?? tests[index].totalQuestions),
    passingBenchmark: Number(updates.passingBenchmark ?? tests[index].passingBenchmark),
    updatedAt: new Date().toISOString()
  };
  tests[index] = updatedTest;
  saveTestsToStorage(tests);
  return updatedTest;
}

export async function archiveMockTest(id) {
  return updateMockTest(id, { status: 'Archived' });
}

export async function deleteMockTest(id) {
  await delay(300);
  const tests = loadTestsFromStorage();
  const filtered = tests.filter((t) => t.id !== id);
  saveTestsToStorage(filtered);
  return { deleted: true, id };
}

