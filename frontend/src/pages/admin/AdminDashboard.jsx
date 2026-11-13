import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/common/StatCard';
import DomainBarChart from '../../components/charts/DomainBarChart';
import { getAdminOverviewStats } from '../../services/adminService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    getAdminOverviewStats()
      .then((data) => {
        if (!ignore) {
          setStats(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const scoreDistItems = (stats?.scoreDistribution || []).map((b) => ({
    domain: b.label,
    correct: b.count,
    total: stats?.totalAttempts || 1,
    accuracy: stats?.totalAttempts ? Math.round((b.count / stats.totalAttempts) * 100) : 0
  }));

  return (
    <AdminLayout
      pageTitle="Admin Overview"
      pageSubtitle="Platform-wide AWS certification metrics, test activity, and student progress."
      headerActions={
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm px-3 fw-semibold"
            onClick={() => navigate('/admin/questions')}
          >
            <i className="bi bi-plus-lg me-1"></i> Question Bank
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-3 fw-semibold"
            onClick={() => navigate('/admin/mock-tests')}
          >
            <i className="bi bi-collection me-1"></i> Manage Tests
          </button>
        </div>
      }
    >
      {isLoading || !stats ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* 6 KPI Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                subtitle="Registered learners"
                icon="bi-people-fill"
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Certifications"
                value={stats.totalCertifications}
                subtitle="AWS exam tracks"
                icon="bi-award-fill"
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Total Mock Tests"
                value={stats.totalMockTests}
                subtitle="Published & draft tests"
                icon="bi-collection-fill"
                color="secondary"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Question Bank"
                value={stats.totalQuestions}
                subtitle="Verified MCQ items"
                icon="bi-database-fill-check"
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Exam Attempts"
                value={stats.totalAttempts}
                subtitle="Total submissions logged"
                icon="bi-clipboard2-check-fill"
                color="warning"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <StatCard
                title="Average Student Score"
                value={`${stats.averageStudentScore}%`}
                subtitle="Across all attempts"
                icon="bi-graph-up"
                color={stats.averageStudentScore >= 70 ? 'success' : 'danger'}
              />
            </div>
          </div>

          {/* Analytics Row */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Score Distribution Across Attempts</h6>
                </div>
                <div className="card-body p-4">
                  <DomainBarChart items={scoreDistItems} emptyMessage="No attempts submitted yet." />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Platform-Wide Domain Mastery</h6>
                </div>
                <div className="card-body p-4">
                  <DomainBarChart items={stats.domainPerformance} emptyMessage="No domain scores available yet." />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Registrations & Attempts */}
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">Recent Student Registrations</h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => navigate('/admin/students')}
                  >
                    Manage
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {stats.recentStudents.map((stu) => (
                      <div key={stu.id} className="list-group-item px-4 py-3 d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold text-dark small">{stu.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stu.email}</div>
                        </div>
                        <span className={`badge ${stu.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                          {stu.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-dark">Recent Exam Attempts</h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => navigate('/admin/attempts')}
                  >
                    View All
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-muted">
                        <tr>
                          <th className="ps-4">Student</th>
                          <th>Exam</th>
                          <th>Score</th>
                          <th className="pe-4">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAttempts.map((att) => (
                          <tr key={att.attemptId}>
                            <td className="ps-4">
                              <div className="fw-semibold small text-dark">{att.studentName}</div>
                              <small className="text-muted">{new Date(att.submittedAt).toLocaleDateString()}</small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{att.examCode}</span>
                            </td>
                            <td className="fw-bold small">{att.percentage}%</td>
                            <td className="pe-4">
                              <span className={`badge ${att.benchmarkMet ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                                {att.benchmarkMet ? 'Pass' : 'Review'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

