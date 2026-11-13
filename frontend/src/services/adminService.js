import { DEMO_STUDENTS } from './mockData';
import { getMockTests, getCertifications } from './mockTestService';
import { getAdminQuestions } from './questionService';
import { loadAllAttemptsFromStorage } from './studentService';

const STUDENTS_STORAGE_KEY = 'cloudprep_demo_students';

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadStudentsFromStorage() {
  try {
    const raw = window.localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [...DEMO_STUDENTS];
}

function saveStudentsToStorage(students) {
  try {
    window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export async function getStudents() {
  await delay(200);
  const students = loadStudentsFromStorage();
  const attempts = loadAllAttemptsFromStorage();

  // Enrich with computed attempt count & average score without exposing sensitive fields
  return students.map((stu) => {
    const stuAttempts = attempts.filter(
      (a) => a.studentId === stu.id || a.studentEmail?.toLowerCase() === stu.email.toLowerCase()
    );
    const avgScore =
      stuAttempts.length > 0
        ? Math.round(
            (stuAttempts.reduce((acc, a) => acc + Number(a.percentage || 0), 0) /
              stuAttempts.length) *
              10
          ) / 10
        : 0;

    return {
      id: stu.id,
      fullName: stu.fullName,
      email: stu.email,
      role: stu.role,
      institution: stu.institution,
      course: stu.course,
      graduationYear: stu.graduationYear,
      status: stu.status,
      createdAt: stu.createdAt,
      attemptsCount: stuAttempts.length,
      averageScore: avgScore
    };
  });
}

export async function toggleStudentStatus(studentId) {
  await delay(250);
  const students = loadStudentsFromStorage();
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) {
    throw new Error('Student record not found.');
  }
  const nextStatus = students[idx].status === 'Active' ? 'Inactive' : 'Active';
  students[idx] = { ...students[idx], status: nextStatus };
  saveStudentsToStorage(students);
  return students[idx];
}

export async function getAllExamAttempts() {
  await delay(200);
  const attempts = loadAllAttemptsFromStorage();
  return attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getAdminOverviewStats() {
  const [students, certifications, mockTests, questions, attempts] = await Promise.all([
    getStudents(),
    getCertifications(),
    getMockTests({ includeDrafts: true }),
    getAdminQuestions(),
    getAllExamAttempts()
  ]);

  const averageStudentScore =
    attempts.length > 0
      ? Math.round(
          (attempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / attempts.length) * 10
        ) / 10
      : 0;

  // Score distribution buckets for analytics charts
  const scoreBuckets = [
    { label: '0–49%', count: 0 },
    { label: '50–69%', count: 0 },
    { label: '70–84%', count: 0 },
    { label: '85–100%', count: 0 }
  ];

  const domainMap = {};
  attempts.forEach((att) => {
    const pct = Number(att.percentage || 0);
    if (pct < 50) scoreBuckets[0].count += 1;
    else if (pct < 70) scoreBuckets[1].count += 1;
    else if (pct < 85) scoreBuckets[2].count += 1;
    else scoreBuckets[3].count += 1;

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

  const domainPerformance = Object.values(domainMap).map((d) => ({
    ...d,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
  }));

  return {
    totalStudents: students.length,
    totalCertifications: certifications.length,
    totalMockTests: mockTests.length,
    totalQuestions: questions.length,
    totalAttempts: attempts.length,
    averageStudentScore,
    recentStudents: [...students].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    recentAttempts: attempts.slice(0, 5),
    scoreDistribution: scoreBuckets,
    domainPerformance
  };
}

