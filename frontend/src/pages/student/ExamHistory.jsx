import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { getStudentExamHistory } from '../../services/studentService';
import DomainBarChart from '../../components/charts/DomainBarChart';

const PAGE_SIZE = 5;

export default function ExamHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    let ignore = false;
    getStudentExamHistory(user)
      .then((data) => {
        if (!ignore) {
          setAttempts(data);
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

  const filtered = attempts
    .filter((att) => {
      const matchesSearch =
        !searchQuery.trim() ||
        att.examName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.examCode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'passed' && att.benchmarkMet) ||
        (statusFilter === 'failed' && !att.benchmarkMet);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') return new Date(a.submittedAt) - new Date(b.submittedAt);
      if (sortBy === 'score-desc') return b.percentage - a.percentage;
      if (sortBy === 'score-asc') return a.percentage - b.percentage;
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Detailed Attempt Drawer/Modal
  const renderAttemptDetailModal = () => {
    if (!selectedAttempt) return null;
    const domainItems = Object.entries(selectedAttempt.domainScores || {}).map(([domain, st]) => ({
      domain,
      correct: st.correct,
      total: st.total,
      accuracy: st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0
    }));

    return (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered mx-3 mx-sm-auto">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
            <div className="modal-header border-bottom py-3 px-4">
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">{selectedAttempt.examName}</h5>
                <small className="text-muted">
                  Attempt ID: {selectedAttempt.attemptId} • Submitted {new Date(selectedAttempt.submittedAt).toLocaleString()}
                </small>
              </div>
              <button type="button" className="btn-close" onClick={() => setSelectedAttempt(null)}></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-2 mb-4 text-center">
                <div className="col-6 col-sm-3">
                  <div className="p-2.5 rounded-3 bg-light border">
                    <div className="fs-4 fw-bold text-primary">{selectedAttempt.percentage}%</div>
                    <small className="text-muted">Final Score</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2.5 rounded-3 bg-success-subtle text-success border border-success-subtle">
                    <div className="fs-4 fw-bold">{selectedAttempt.correctAnswers}</div>
                    <small>Correct</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2.5 rounded-3 bg-danger-subtle text-danger border border-danger-subtle">
                    <div className="fs-4 fw-bold">{selectedAttempt.incorrectAnswers}</div>
                    <small>Incorrect</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2.5 rounded-3 bg-secondary-subtle text-secondary border">
                    <div className="fs-4 fw-bold">{selectedAttempt.unanswered}</div>
                    <small>Unanswered</small>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3">Domain Performance Breakdown</h6>
              <div className="p-3 bg-light rounded-3 border mb-4">
                <DomainBarChart items={domainItems} />
              </div>

              <h6 className="fw-bold text-dark mb-3">Question-by-Question Review</h6>
              {(!selectedAttempt.review || selectedAttempt.review.length === 0) ? (
                <div className="alert alert-info small mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Question-level review details are stored for live AWS exam attempts. Take a new mock exam to inspect full explanations here!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {selectedAttempt.review.map((q) => (
                    <div key={q.id} className="border rounded-3 p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary">Q{q.id} • {q.domain}</span>
                        <span className={`badge ${q.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                          {q.isCorrect ? 'Correct' : 'Incorrect / Skipped'}
                        </span>
                      </div>
                      <p className="fw-semibold text-dark small mb-2">{q.question}</p>
                      <div className="small text-secondary mb-2">
                        <strong>Your Selection:</strong>{' '}
                        {q.selectedAnswers?.length ? q.selectedAnswers.join(', ') : 'None'} |{' '}
                        <strong>Correct Answer:</strong> {q.correctAnswers?.join(', ')}
                      </div>
                      {q.explanation && (
                        <div className="p-2 bg-light rounded small text-secondary">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer border-top py-2.5 px-4 bg-light">
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => {
                  const testId = selectedAttempt.mockTestId || 'clf-c02-live';
                  setSelectedAttempt(null);
                  navigate(`/exam/${testId}`);
                }}
              >
                Retake Exam
              </button>
              <button type="button" className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedAttempt(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout
      pageTitle="My Exams & History"
      pageSubtitle="Review all past certification attempts, scores, and explanations."
    >
      {/* Search, Filter & Sort Controls */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search exam name or code..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="passed">Benchmark Met (≥70%)</option>
                <option value="failed">Needs Review (&lt;70%)</option>
              </select>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score First</option>
                <option value="score-asc">Lowest Score First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-clock-history fs-1 mb-2 d-block"></i>
              <p className="mb-3">No matching exam attempts found.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => navigate('/student/tests')}
              >
                Explore Mock Tests
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase" style={{ fontSize: '0.73rem' }}>
                  <tr>
                    <th className="ps-4">Exam Name</th>
                    <th>Attempt Date</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                    <th>Unanswered</th>
                    <th>Benchmark</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((att) => (
                    <tr key={att.attemptId}>
                      <td className="ps-4">
                        <div className="fw-semibold text-dark small">{att.examName}</div>
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                          {att.examCode}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(att.submittedAt).toLocaleDateString()} <br />
                        <small className="text-muted">{new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{att.percentage}%</div>
                        <small className="text-muted">
                          {att.correctAnswers}/{att.totalQuestions}
                        </small>
                      </td>
                      <td className="text-success fw-semibold">{att.correctAnswers}</td>
                      <td className="text-danger fw-semibold">{att.incorrectAnswers}</td>
                      <td className="text-secondary">{att.unanswered}</td>
                      <td>
                        <span
                          className={`badge ${
                            att.benchmarkMet
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                          }`}
                        >
                          {att.benchmarkMet ? 'Benchmark Met' : 'Needs Review'}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm fw-medium"
                          onClick={() => setSelectedAttempt(att)}
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex align-items-center justify-content-between">
            <small className="text-muted">
              Showing {paginated.length} of {filtered.length} attempts
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${safePage === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {renderAttemptDetailModal()}
    </StudentLayout>
  );
}

