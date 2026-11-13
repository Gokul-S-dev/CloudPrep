import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getStudents, toggleStudentStatus, getAllExamAttempts } from '../../services/adminService';
import { computeStudentAnalytics } from '../../services/studentService';
import DomainBarChart from '../../components/charts/DomainBarChart';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [togglingStudent, setTogglingStudent] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stuList, attList] = await Promise.all([getStudents(), getAllExamAttempts()]);
      setStudents(stuList);
      setAttempts(attList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([getStudents(), getAllExamAttempts()])
      .then(([stuList, attList]) => {
        if (!ignore) {
          setStudents(stuList);
          setAttempts(attList);
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

  const filtered = students.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmToggle = async () => {
    if (!togglingStudent) return;
    setIsUpdatingStatus(true);
    try {
      await toggleStudentStatus(togglingStudent.id);
      setTogglingStudent(null);
      await loadData();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStudentProfileModal = () => {
    if (!selectedStudent) return null;
    const stuAttempts = attempts.filter(
      (a) =>
        a.studentId === selectedStudent.id ||
        a.studentEmail?.toLowerCase() === selectedStudent.email.toLowerCase()
    );
    const analytics = computeStudentAnalytics(stuAttempts);

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered mx-3 mx-sm-auto">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
            <div className="modal-header border-bottom py-3 px-4">
              <div>
                <h5 className="modal-title fw-bold mb-0">{selectedStudent.fullName}</h5>
                <small className="text-muted">{selectedStudent.email}</small>
              </div>
              <button type="button" className="btn-close" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3 mb-4 small">
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Institution</div>
                  <div className="fw-semibold text-dark">{selectedStudent.institution || '—'}</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Course</div>
                  <div className="fw-semibold text-dark">{selectedStudent.course || '—'}</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Graduation Year</div>
                  <div className="fw-semibold text-dark">{selectedStudent.graduationYear || '—'}</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Registered</div>
                  <div className="fw-semibold text-dark">
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Average Score</div>
                  <div className="fw-bold text-primary">{analytics.averageScore}%</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="text-muted">Account Status</div>
                  <span className={`badge ${selectedStudent.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-2">Domain Performance</h6>
              <div className="p-3 bg-light rounded-3 border mb-4">
                <DomainBarChart items={analytics.domainBreakdown} emptyMessage="No attempts recorded yet." />
              </div>

              <h6 className="fw-bold text-dark mb-2">Exam History ({stuAttempts.length})</h6>
              {stuAttempts.length === 0 ? (
                <div className="text-muted small">No exam attempts recorded for this student.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Exam</th>
                        <th>Date</th>
                        <th>Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stuAttempts.map((a) => (
                        <tr key={a.attemptId} className="small">
                          <td>{a.examName}</td>
                          <td>{new Date(a.submittedAt).toLocaleDateString()}</td>
                          <td className="fw-bold">{a.percentage}%</td>
                          <td>
                            <span className={`badge ${a.benchmarkMet ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                              {a.benchmarkMet ? 'Pass' : 'Review'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer border-top py-2.5 px-4 bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      pageTitle="Student Management"
      pageSubtitle="View registered candidates, inspect performance, and manage account access."
    >
      {/* Search & Status Filter */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Account Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">No students match your search criteria.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase" style={{ fontSize: '0.73rem' }}>
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Institution</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((stu) => (
                    <tr key={stu.id}>
                      <td className="ps-4">
                        <div className="fw-semibold text-dark small">{stu.fullName}</div>
                        <small className="text-muted">{stu.email}</small>
                      </td>
                      <td className="small text-secondary">
                        <div>{stu.institution}</div>
                        <small className="text-muted">{stu.course}</small>
                      </td>
                      <td className="small fw-semibold">{stu.attemptsCount}</td>
                      <td className="small fw-bold text-primary">{stu.averageScore}%</td>
                      <td>
                        <span className={`badge ${stu.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                          {stu.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setSelectedStudent(stu)}
                          >
                            <i className="bi bi-person-lines-fill me-1"></i> Profile
                          </button>
                          <button
                            type="button"
                            className={`btn ${stu.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => setTogglingStudent(stu)}
                          >
                            {stu.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {renderStudentProfileModal()}

      <ConfirmModal
        show={Boolean(togglingStudent)}
        title={togglingStudent?.status === 'Active' ? 'Deactivate Student Account?' : 'Activate Student Account?'}
        message={`Are you sure you want to ${togglingStudent?.status === 'Active' ? 'deactivate' : 'activate'} ${togglingStudent?.fullName} (${togglingStudent?.email})?`}
        confirmLabel={togglingStudent?.status === 'Active' ? 'Deactivate' : 'Activate'}
        confirmVariant={togglingStudent?.status === 'Active' ? 'warning' : 'success'}
        onCancel={() => setTogglingStudent(null)}
        onConfirm={handleConfirmToggle}
        isLoading={isUpdatingStatus}
      />
    </AdminLayout>
  );
}

