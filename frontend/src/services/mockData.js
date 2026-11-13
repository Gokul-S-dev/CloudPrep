/**
 * Separated Demo & Preview Data Adapter
 * Used strictly for frontend preview / demo mode when backend CRUD endpoints
 * are not yet provisioned. Kept strictly separate from production AWS API responses.
 */

export const DEMO_CERTIFICATIONS = [
  {
    id: 'cert-clf-c02',
    code: 'CLF-C02',
    name: 'AWS Certified Cloud Practitioner',
    level: 'Foundational',
    description: 'Validates overall understanding of the AWS Cloud platform, covering basic security, architecture, pricing, and support.',
    domains: [
      { name: 'Cloud Concepts', weight: 24 },
      { name: 'Security and Compliance', weight: 30 },
      { name: 'Cloud Technology and Services', weight: 34 },
      { name: 'Billing, Pricing, and Support', weight: 12 }
    ],
    status: 'Active'
  },
  {
    id: 'cert-saa-c03',
    code: 'SAA-C03',
    name: 'AWS Certified Solutions Architect – Associate',
    level: 'Associate',
    description: 'Validates the ability to design and implement distributed systems on AWS.',
    domains: [
      { name: 'Design Secure Architectures', weight: 30 },
      { name: 'Design Resilient Architectures', weight: 26 },
      { name: 'Design High-Performing Architectures', weight: 24 },
      { name: 'Design Cost-Optimized Architectures', weight: 20 }
    ],
    status: 'Active'
  },
  {
    id: 'cert-dva-c02',
    code: 'DVA-C02',
    name: 'AWS Certified Developer – Associate',
    level: 'Associate',
    description: 'Validates proficiency in developing, testing, deploying, and debugging AWS Cloud-based applications.',
    domains: [
      { name: 'Development with AWS Services', weight: 32 },
      { name: 'Security', weight: 26 },
      { name: 'Deployment', weight: 24 },
      { name: 'Troubleshooting and Optimization', weight: 18 }
    ],
    status: 'Coming Soon'
  },
  {
    id: 'cert-soa-c02',
    code: 'SOA-C02',
    name: 'AWS Certified SysOps Administrator – Associate',
    level: 'Associate',
    description: 'Validates experience deploying, managing, and operating workloads on AWS.',
    domains: [
      { name: 'Monitoring, Logging, and Remediation', weight: 20 },
      { name: 'Reliability and Business Continuity', weight: 16 },
      { name: 'Deployment, Provisioning, and Automation', weight: 18 },
      { name: 'Security and Compliance', weight: 16 },
      { name: 'Networking and Content Delivery', weight: 18 },
      { name: 'Cost and Performance Optimization', weight: 12 }
    ],
    status: 'Coming Soon'
  }
];

export const DEMO_MOCK_TESTS = [
  {
    id: 'clf-c02-live',
    title: 'CLF-C02 Full Practice Examination 1',
    certification: 'AWS Certified Cloud Practitioner',
    examCode: 'CLF-C02',
    description: 'Official specification-aligned mock exam powered by the live AWS Serverless backend (API Gateway, Lambda, S3 & DynamoDB).',
    durationMinutes: 90,
    totalQuestions: 65,
    passingBenchmark: 70,
    difficulty: 'Foundational',
    status: 'Published',
    usesLiveApi: true,
    attemptsCount: 142,
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'clf-c02-security-drill',
    title: 'CLF-C02 Security & Shared Responsibility Drill',
    certification: 'AWS Certified Cloud Practitioner',
    examCode: 'CLF-C02',
    description: 'Focused practice test covering IAM, KMS, Shield, WAF, and the AWS Shared Responsibility Model.',
    durationMinutes: 30,
    totalQuestions: 15,
    passingBenchmark: 70,
    difficulty: 'Intermediate',
    status: 'Published',
    usesLiveApi: false,
    attemptsCount: 64,
    createdAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'saa-c03-preview',
    title: 'SAA-C03 Architecture Fundamentals Preview',
    certification: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    description: 'Associate-level scenario mock test focusing on VPC design, high availability, and serverless resilience.',
    durationMinutes: 65,
    totalQuestions: 30,
    passingBenchmark: 72,
    difficulty: 'Advanced',
    status: 'Draft',
    usesLiveApi: false,
    attemptsCount: 0,
    createdAt: '2026-11-01T09:00:00Z'
  }
];

export const DEMO_STUDENTS = [
  {
    id: 'stu-001',
    fullName: 'Aarav Sharma',
    email: 'student@cloudprep.demo',
    role: 'student',
    institution: 'National Institute of Technology',
    course: 'B.Tech Computer Science',
    graduationYear: '2026',
    status: 'Active',
    createdAt: '2026-09-15T08:30:00Z'
  },
  {
    id: 'stu-002',
    fullName: 'Priya Nair',
    email: 'priya.nair@example.edu',
    role: 'student',
    institution: 'RV College of Engineering',
    course: 'B.E. Information Science',
    graduationYear: '2026',
    status: 'Active',
    createdAt: '2026-09-22T11:15:00Z'
  },
  {
    id: 'stu-003',
    fullName: 'Rohan Verma',
    email: 'rohan.v@example.edu',
    role: 'student',
    institution: 'VIT Vellore',
    course: 'M.Tech Cloud Computing',
    graduationYear: '2027',
    status: 'Active',
    createdAt: '2026-10-05T16:40:00Z'
  },
  {
    id: 'stu-004',
    fullName: 'Meera Krishnan',
    email: 'meera.k@example.edu',
    role: 'student',
    institution: 'Anna University',
    course: 'B.Tech Information Technology',
    graduationYear: '2025',
    status: 'Inactive',
    createdAt: '2026-10-18T10:05:00Z'
  }
];

export const DEMO_EXAM_ATTEMPTS = [
  {
    attemptId: 'att-demo-1001',
    studentId: 'stu-001',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@cloudprep.demo',
    mockTestId: 'clf-c02-live',
    examName: 'CLF-C02 Full Practice Examination 1',
    examCode: 'CLF-C02',
    certification: 'AWS Certified Cloud Practitioner',
    submittedAt: '2026-10-20T14:22:00Z',
    timeSpent: 2840,
    totalQuestions: 12,
    correctAnswers: 7,
    incorrectAnswers: 4,
    unanswered: 1,
    percentage: 58.33,
    practiceBenchmark: 70,
    benchmarkMet: false,
    domainScores: {
      'Cloud Concepts': { total: 2, correct: 2 },
      'Security and Compliance': { total: 3, correct: 1 },
      'Cloud Technology and Services': { total: 4, correct: 2 },
      'Billing, Pricing, and Support': { total: 3, correct: 2 }
    },
    review: []
  },
  {
    attemptId: 'att-demo-1002',
    studentId: 'stu-001',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@cloudprep.demo',
    mockTestId: 'clf-c02-live',
    examName: 'CLF-C02 Full Practice Examination 1',
    examCode: 'CLF-C02',
    certification: 'AWS Certified Cloud Practitioner',
    submittedAt: '2026-11-02T17:45:00Z',
    timeSpent: 3120,
    totalQuestions: 12,
    correctAnswers: 9,
    incorrectAnswers: 3,
    unanswered: 0,
    percentage: 75.0,
    practiceBenchmark: 70,
    benchmarkMet: true,
    domainScores: {
      'Cloud Concepts': { total: 2, correct: 2 },
      'Security and Compliance': { total: 3, correct: 2 },
      'Cloud Technology and Services': { total: 4, correct: 3 },
      'Billing, Pricing, and Support': { total: 3, correct: 2 }
    },
    review: []
  },
  {
    attemptId: 'att-demo-1003',
    studentId: 'stu-001',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@cloudprep.demo',
    mockTestId: 'clf-c02-live',
    examName: 'CLF-C02 Full Practice Examination 1',
    examCode: 'CLF-C02',
    certification: 'AWS Certified Cloud Practitioner',
    submittedAt: '2026-11-09T11:10:00Z',
    timeSpent: 2410,
    totalQuestions: 12,
    correctAnswers: 10,
    incorrectAnswers: 2,
    unanswered: 0,
    percentage: 83.33,
    practiceBenchmark: 70,
    benchmarkMet: true,
    domainScores: {
      'Cloud Concepts': { total: 2, correct: 2 },
      'Security and Compliance': { total: 3, correct: 3 },
      'Cloud Technology and Services': { total: 4, correct: 3 },
      'Billing, Pricing, and Support': { total: 3, correct: 2 }
    },
    review: []
  },
  {
    attemptId: 'att-demo-1004',
    studentId: 'stu-002',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@example.edu',
    mockTestId: 'clf-c02-live',
    examName: 'CLF-C02 Full Practice Examination 1',
    examCode: 'CLF-C02',
    certification: 'AWS Certified Cloud Practitioner',
    submittedAt: '2026-11-10T09:30:00Z',
    timeSpent: 3400,
    totalQuestions: 12,
    correctAnswers: 11,
    incorrectAnswers: 1,
    unanswered: 0,
    percentage: 91.67,
    practiceBenchmark: 70,
    benchmarkMet: true,
    domainScores: {
      'Cloud Concepts': { total: 2, correct: 2 },
      'Security and Compliance': { total: 3, correct: 3 },
      'Cloud Technology and Services': { total: 4, correct: 4 },
      'Billing, Pricing, and Support': { total: 3, correct: 2 }
    },
    review: []
  },
  {
    attemptId: 'att-demo-1005',
    studentId: 'stu-003',
    studentName: 'Rohan Verma',
    studentEmail: 'rohan.v@example.edu',
    mockTestId: 'clf-c02-security-drill',
    examName: 'CLF-C02 Security & Shared Responsibility Drill',
    examCode: 'CLF-C02',
    certification: 'AWS Certified Cloud Practitioner',
    submittedAt: '2026-11-11T16:15:00Z',
    timeSpent: 1200,
    totalQuestions: 15,
    correctAnswers: 10,
    incorrectAnswers: 4,
    unanswered: 1,
    percentage: 66.67,
    practiceBenchmark: 70,
    benchmarkMet: false,
    domainScores: {
      'Security and Compliance': { total: 15, correct: 10 }
    },
    review: []
  }
];

