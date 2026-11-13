import { DEMO_EXAM_ATTEMPTS } from './mockData';
import { updateStoredUser } from './authService';

const ATTEMPTS_STORAGE_KEY = 'cloudprep_demo_exam_attempts';

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function loadAllAttemptsFromStorage() {
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [...DEMO_EXAM_ATTEMPTS];
}

function saveAllAttemptsToStorage(attempts) {
  try {
    window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

export async function getStudentProfile(currentUser) {
  await delay(150);
  return { ...currentUser };
}

export async function updateStudentProfile(updates) {
  await delay(300);
  const updated = updateStoredUser({
    fullName: updates.fullName?.trim(),
    institution: updates.institution?.trim(),
    course: updates.course?.trim(),
    graduationYear: updates.graduationYear?.trim(),
    avatarUrl: updates.avatarUrl || ''
  });
  if (!updated) {
    throw new Error('Unable to update profile session.');
  }
  return updated;
}

export async function getStudentExamHistory(student) {
  await delay(200);
  const allAttempts = loadAllAttemptsFromStorage();
  const filtered = allAttempts.filter(
    (att) =>
      att.studentId === student?.id ||
      (student?.email && att.studentEmail?.toLowerCase() === student.email.toLowerCase())
  );

  // Sort newest first
  return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function recordStudentAttempt(student, testMeta, examResult) {
  const allAttempts = loadAllAttemptsFromStorage();

  const newAttempt = {
    attemptId: examResult.attemptId || `att-${Date.now()}`,
    studentId: student?.id || 'guest',
    studentName: student?.fullName || 'Candidate',
    studentEmail: student?.email || 'guest@cloudprep.demo',
    mockTestId: testMeta?.id || 'clf-c02-live',
    examName: testMeta?.title || 'CLF-C02 Full Practice Examination 1',
    examCode: testMeta?.examCode || 'CLF-C02',
    certification: testMeta?.certification || 'AWS Certified Cloud Practitioner',
    submittedAt: examResult.submittedAt || new Date().toISOString(),
    timeSpent: examResult.timeSpent || 0,
    totalQuestions: examResult.totalQuestions || 0,
    correctAnswers: examResult.correctAnswers || 0,
    incorrectAnswers: examResult.incorrectAnswers || 0,
    unanswered: examResult.unanswered || 0,
    percentage: Number(examResult.percentage ?? 0),
    practiceBenchmark: examResult.practiceBenchmark || 70,
    benchmarkMet: Boolean(examResult.benchmarkMet),
    domainScores: examResult.domainScores || {},
    review: examResult.review || []
  };

  // Avoid duplicate recording for the same attemptId
  const exists = allAttempts.some((a) => a.attemptId === newAttempt.attemptId);
  if (!exists) {
    const updated = [newAttempt, ...allAttempts];
    saveAllAttemptsToStorage(updated);
  }
  return newAttempt;
}

/**
 * Derive student performance analytics exclusively from actual exam attempt records
 */
export function computeStudentAnalytics(attempts = []) {
  if (!attempts || attempts.length === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      highestScore: 0,
      totalStudySeconds: 0,
      benchmarkPassCount: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalUnanswered: 0,
      domainBreakdown: [],
      strongestDomains: [],
      weakestDomains: [],
      scoreProgression: [],
      suggestedImprovements: []
    };
  }

  let scoreSum = 0;
  let highestScore = 0;
  let totalStudySeconds = 0;
  let benchmarkPassCount = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;
  const domainMap = {};

  attempts.forEach((att) => {
    const pct = Number(att.percentage || 0);
    scoreSum += pct;
    if (pct > highestScore) highestScore = pct;
    totalStudySeconds += Number(att.timeSpent || 0);
    if (att.benchmarkMet) benchmarkPassCount += 1;
    totalCorrect += Number(att.correctAnswers || 0);
    totalIncorrect += Number(att.incorrectAnswers || 0);
    totalUnanswered += Number(att.unanswered || 0);

    if (att.domainScores && typeof att.domainScores === 'object') {
      Object.entries(att.domainScores).forEach(([domain, stats]) => {
        if (!domainMap[domain]) {
          domainMap[domain] = { domain, total: 0, correct: 0 };
        }
        domainMap[domain].total += Number(stats.total || 0);
        domainMap[domain].correct += Number(stats.correct || 0);
      });
    }
  });

  const domainBreakdown = Object.values(domainMap).map((d) => ({
    ...d,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
  }));

  const sortedByAccuracy = [...domainBreakdown].sort((a, b) => b.accuracy - a.accuracy);
  const strongestDomains = sortedByAccuracy.filter((d) => d.accuracy >= 70);
  const weakestDomains = [...domainBreakdown]
    .filter((d) => d.accuracy < 75)
    .sort((a, b) => a.accuracy - b.accuracy);

  const chronological = [...attempts].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
  );

  const scoreProgression = chronological.map((att, idx) => ({
    label: `Attempt #${idx + 1}`,
    examCode: att.examCode,
    score: Math.round(Number(att.percentage || 0)),
    date: att.submittedAt
  }));

  const suggestedImprovements = weakestDomains.map((d) => ({
    domain: d.domain,
    accuracy: d.accuracy,
    recommendation:
      d.accuracy < 50
        ? `Focus on foundational AWS whitepapers and core services within ${d.domain}.`
        : `Review missed explanations in ${d.domain} to cross the 75% mastery threshold.`
  }));

  return {
    totalExams: attempts.length,
    averageScore: Math.round((scoreSum / attempts.length) * 10) / 10,
    highestScore: Math.round(highestScore * 10) / 10,
    totalStudySeconds,
    benchmarkPassCount,
    totalCorrect,
    totalIncorrect,
    totalUnanswered,
    domainBreakdown,
    strongestDomains,
    weakestDomains,
    scoreProgression,
    suggestedImprovements
  };
}

