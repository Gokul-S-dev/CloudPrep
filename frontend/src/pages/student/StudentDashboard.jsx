import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/student/StudentLayout';
import StatCard from '../../components/common/StatCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import DomainBarChart from '../../components/charts/DomainBarChart';
import { useAuth } from '../../context/AuthContext';
import { getStudentExamHistory, computeStudentAnalytics } from '../../services/studentService';
import { getMockTests } from '../../services/mockTestService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([getStudentExamHistory(user), getMockTests({ includeDrafts: false })])
      .then(([hist, tests]) => {
        if (!ignore) {
          setAttempts(hist);
          setMockTests(tests);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user]);

  const analytics = computeStudentAnalytics(attempts);
  const studyHours = Math.round((analytics.totalStudySeconds / 3600) * 10) / 10;

  return (
    <StudentLayout
      pageTitle={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Student'}`}
      pageSubtitle="Track your AWS certification readiness, scores, and domain mastery."
      headerActions={
        <button
          type="button"
          className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
          onClick={() => navigate('/student/tests')}
        >
          <i className="bi bi-play-circle-fill"></i>
          <span>Take Mock Exam</span>
        </button>
      }
    >
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Exams Attempted"
                value={analytics.totalExams}
                subtitle={`${analytics.benchmarkPassCount} benchmark passes`}
                icon="bi-journal-check"
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Average Score"
                value={`${analytics.averageScore}%`}
                subtitle="Target Benchmark: 70%"
                icon="bi-speedometer"
                color={analytics.averageScore >= 70 ? 'success' : 'warning'}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Highest Score"
                value={`${analytics.highestScore}%`}
                subtitle="Personal best score"
                icon="bi-trophy"
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Tracked Study Time"
                value={`${studyHours} hrs`}
                subtitle="Measured exam duration"
                icon="bi-clock-history"
                color="secondary"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-graph-up text-primary me-2"></i>
                    Score Progression Trend
                  </h6>
                  <span className="badge bg-success-subtle text-success small">70% Benchmark Line</span>
                </div>
                <div className="card-body p-4">
                  <LineTrendChart
                    data={analytics.scoreProgression}
                    emptyMessage="Complete your first mock exam to see your score progression chart."
                  />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-layers text-primary me-2"></i>
                    Domain Strengths & Weaknesses
                  </h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => navigate('/student/performance')}
                  >
                    Details
                  </button>
                </div>
                <div className="card-body p-4">
                  <DomainBarChart
                    items={analytics.domainBreakdown}
                    emptyMessage="Complete a mock exam to unlock domain analytics."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attempts & Recommended Tests */}
          <div className="row g-4">
            {/* Recent Attempts */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-clock-history text-primary me-2"></i>
                    Recent Exam Attempts
                  </h6>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/student/history')}
                  >
                    View All
                  </button>
                </div>
                <div className="card-body p-0">
                  {attempts.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                      No exam attempts yet. Launch a mock test to get started!
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light small text-muted">
                          <tr>
                            <th className="ps-4">Mock Exam</th>
                            <th>Date</th>
                            <th>Score</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attempts.slice(0, 4).map((att) => (
                            <tr key={att.attemptId}>
                              <td className="ps-4">
                                <div className="fw-semibold text-dark small">{att.examName}</div>
                                <small className="text-muted">{att.examCode}</small>
                              </td>
                              <td className="small text-secondary">
                                {new Date(att.submittedAt).toLocaleDateString()}
                              </td>
                              <td className="fw-bold small">
                                {att.percentage}%{' '}
                                <span className="text-muted fw-normal">
                                  ({att.correctAnswers}/{att.totalQuestions})
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    att.benchmarkMet
                                      ? 'bg-success-subtle text-success'
                                      : 'bg-warning-subtle text-warning-emphasis'
                                  }`}
                                >
                                  {att.benchmarkMet ? 'Benchmark Met' : 'Needs Review'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Mock Tests */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-stars text-warning me-2"></i>
                    Recommended Mock Tests
                  </h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => navigate('/student/tests')}
                  >
                    Catalogue
                  </button>
                </div>
                <div className="card-body p-3 d-flex flex-column gap-3">
                  {mockTests.slice(0, 2).map((test) => (
                    <div key={test.id} className="border rounded-3 p-3 bg-light">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <span className="badge bg-primary">{test.examCode}</span>
                        <span className="badge bg-white text-secondary border">{test.difficulty}</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{test.title}</h6>
                      <p className="text-muted small mb-2">{test.totalQuestions} Questions • {test.durationMinutes} Mins</p>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm w-100 fw-semibold"
                        onClick={() => navigate(`/exam/${test.id}`)}
                      >
                        <i className="bi bi-play-fill me-1"></i> Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </StudentLayout>
  );
}

