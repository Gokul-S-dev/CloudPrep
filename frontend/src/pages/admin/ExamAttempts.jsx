import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DomainBarChart from '../../components/charts/DomainBarChart';
import { getAllExamAttempts } from '../../services/adminService';
import { getCertifications } from '../../services/mockTestService';

export default function ExamAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [studentFilter, setStudentFilter] = useState('');
  const [certFilter, setCertFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([getAllExamAttempts(), getCertifications()])
      .then(([attList, certList]) => {
        if (!ignore) {
          setAttempts(attList);
          setCertifications(certList);
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

  const filtered = attempts.filter((att) => {
    const matchesStudent =
      !studentFilter.trim() ||
      att.studentName?.toLowerCase().includes(studentFilter.toLowerCase()) ||
      att.studentEmail?.toLowerCase().includes(studentFilter.toLowerCase());
    const matchesCert = certFilter === 'all' || att.examCode === certFilter;
    const matchesDate =
      !dateFilter || new Date(att.submittedAt).toISOString().slice(0, 10) === dateFilter;
    return matchesStudent && matchesCert && matchesDate;
  });

  // Score distribution across filtered attempts
  const distBuckets = [
    { domain: '85–100% (Mastery)', count: filtered.filter((a) => a.percentage >= 85).length },
    { domain: '70–84% (Benchmark Met)', count: filtered.filter((a) => a.percentage >= 70 && a.percentage < 85).length },
    { domain: '50–69% (Developing)', count: filtered.filter((a) => a.percentage >= 50 && a.percentage < 70).length },
    { domain: '0–49% (Needs Focus)', count: filtered.filter((a) => a.percentage < 50).length }
  ].map((b) => ({
    domain: b.domain,
    correct: b.count,
    total: filtered.length || 1,
    accuracy: filtered.length > 0 ? Math.round((b.count / filtered.length) * 100) : 0
  }));

  return (
    <AdminLayout
      pageTitle="Exam Attempts"
      pageSubtitle="Inspect candidate exam submissions, score distribution, and domain-wise performance."
    >
      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by student name or email..."
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value)}
              >
                <option value="all">All Certifications</option>
                {certifications.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Snapshot */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-white border-bottom py-2.5 px-4">
          <h6 className="mb-0 fw-bold text-dark">Filtered Score Distribution ({filtered.length} Attempts)</h6>
        </div>
        <div className="card-body p-4">
          <DomainBarChart items={distBuckets} emptyMessage="No attempts match the current filters." />
        </div>
      </div>

      {/* Attempts Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">No exam attempts match your filters.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase" style={{ fontSize: '0.73rem' }}>
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Mock Exam</th>
                    <th>Submitted</th>
                    <th>Score</th>
                    <th>Benchmark</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((att) => (
                    <tr key={att.attemptId}>
                      <td className="ps-4">
                        <div className="fw-semibold text-dark small">{att.studentName}</div>
                        <small className="text-muted">{att.studentEmail}</small>
                      </td>
                      <td>
                        <div className="small fw-medium text-dark">{att.examName}</div>
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                          {att.examCode}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(att.submittedAt).toLocaleString()}
                      </td>
                      <td className="fw-bold small">
                        {att.percentage}%{' '}
                        <span className="text-muted fw-normal">
                          ({att.correctAnswers}/{att.totalQuestions})
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${att.benchmarkMet ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                          {att.benchmarkMet ? 'Benchmark Met' : 'Needs Review'}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setSelectedAttempt(att)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attempt Detail Modal */}
      {selectedAttempt && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold mb-0">{selectedAttempt.examName}</h5>
                  <small className="text-muted">
                    Candidate: {selectedAttempt.studentName} ({selectedAttempt.studentEmail}) • ID: {selectedAttempt.attemptId}
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedAttempt(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-2 mb-4 text-center">
                  <div className="col-3">
                    <div className="p-2 rounded border bg-light">
                      <div className="fs-4 fw-bold text-primary">{selectedAttempt.percentage}%</div>
                      <small className="text-muted">Score</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 rounded border bg-success-subtle text-success">
                      <div className="fs-4 fw-bold">{selectedAttempt.correctAnswers}</div>
                      <small>Correct</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 rounded border bg-danger-subtle text-danger">
                      <div className="fs-4 fw-bold">{selectedAttempt.incorrectAnswers}</div>
                      <small>Incorrect</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 rounded border bg-secondary-subtle text-secondary">
                      <div className="fs-4 fw-bold">{selectedAttempt.unanswered}</div>
                      <small>Skipped</small>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Domain-Wise Performance</h6>
                <div className="p-3 bg-light rounded border">
                  <DomainBarChart
                    items={Object.entries(selectedAttempt.domainScores || {}).map(([domain, st]) => ({
                      domain,
                      correct: st.correct,
                      total: st.total,
                      accuracy: st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0
                    }))}
                  />
                </div>
              </div>
              <div className="modal-footer border-top py-2.5 px-4 bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedAttempt(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

