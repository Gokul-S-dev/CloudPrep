import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  getMockTests,
  getCertifications,
  createMockTest,
  updateMockTest,
  archiveMockTest,
  deleteMockTest
} from '../../services/mockTestService';
import { getAdminQuestions } from '../../services/questionService';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
  title: '',
  certification: 'AWS Certified Cloud Practitioner',
  examCode: 'CLF-C02',
  description: '',
  durationMinutes: 90,
  totalQuestions: 65,
  passingBenchmark: 70,
  difficulty: 'Foundational',
  status: 'Draft'
};

export default function MockTestManagement() {
  const [tests, setTests] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Create / Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Details modal
  const [viewingTest, setViewingTest] = useState(null);

  // Delete / Archive confirmation modal
  const [deletingTest, setDeletingTest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, cList, qList] = await Promise.all([
        getMockTests({ includeDrafts: true }),
        getCertifications(),
        getAdminQuestions()
      ]);
      setTests(tList);
      setCertifications(cList);
      setQuestions(qList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getMockTests({ includeDrafts: true }),
      getCertifications(),
      getAdminQuestions()
    ])
      .then(([tList, cList, qList]) => {
        if (!ignore) {
          setTests(tList);
          setCertifications(cList);
          setQuestions(qList);
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

  const openCreateModal = () => {
    setEditingTest(null);
    setFormState(EMPTY_FORM);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    setFormState({
      title: test.title,
      certification: test.certification,
      examCode: test.examCode,
      description: test.description || '',
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions,
      passingBenchmark: test.passingBenchmark,
      difficulty: test.difficulty,
      status: test.status
    });
    setFormError('');
    setShowFormModal(true);
  };

  const handleCertSelect = (code) => {
    const found = certifications.find((c) => c.code === code);
    setFormState((prev) => ({
      ...prev,
      examCode: code,
      certification: found ? found.name : prev.certification
    }));
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.title.trim()) {
      setFormError('Mock test title is required.');
      return;
    }
    if (formState.durationMinutes <= 0 || formState.totalQuestions <= 0) {
      setFormError('Duration and question count must be greater than zero.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTest) {
        await updateMockTest(editingTest.id, formState);
      } else {
        await createMockTest(formState);
      }
      setShowFormModal(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Unable to save mock test.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTest) return;
    setIsDeleting(true);
    try {
      await deleteMockTest(deletingTest.id);
      setDeletingTest(null);
      await loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveInstead = async () => {
    if (!deletingTest) return;
    setIsDeleting(true);
    try {
      await archiveMockTest(deletingTest.id);
      setDeletingTest(null);
      await loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = tests
    .filter((t) => {
      const qMatch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.examCode.toLowerCase().includes(searchQuery.toLowerCase());
      const sMatch = statusFilter === 'all' || t.status === statusFilter;
      const cMatch = certFilter === 'all' || t.examCode === certFilter;
      return qMatch && sMatch && cMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'attempts') return (b.attemptsCount || 0) - (a.attemptsCount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getQuestionCountForTest = (testId) => {
    return questions.filter((q) => q.mockTestId === testId).length;
  };

  return (
    <AdminLayout
      pageTitle="Mock Test Management"
      pageSubtitle="Create, configure, publish, or archive certification mock tests."
      headerActions={
        <button
          type="button"
          className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Mock Test</span>
        </button>
      }
    >
      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search mock test title or code..."
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
                value={certFilter}
                onChange={(e) => {
                  setCertFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Certifications</option>
                {certifications.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
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
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="title">Title (A–Z)</option>
                <option value="attempts">Most Attempted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No mock tests found matching your filters.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase" style={{ fontSize: '0.73rem' }}>
                  <tr>
                    <th className="ps-4">Mock Test Title</th>
                    <th>Certification</th>
                    <th>Duration</th>
                    <th>Questions</th>
                    <th>Benchmark</th>
                    <th>Attempts</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-4">
                        <div className="fw-semibold text-dark small">{t.title}</div>
                        <small className="text-muted">{t.difficulty}</small>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">{t.examCode}</span>
                      </td>
                      <td className="small">{t.durationMinutes} min</td>
                      <td className="small">
                        {t.totalQuestions} <span className="text-muted">({getQuestionCountForTest(t.id)} bank)</span>
                      </td>
                      <td className="small">{t.passingBenchmark}%</td>
                      <td className="small fw-semibold">{t.attemptsCount || 0}</td>
                      <td>
                        <span
                          className={`badge ${
                            t.status === 'Published'
                              ? 'bg-success-subtle text-success'
                              : t.status === 'Draft'
                              ? 'bg-warning-subtle text-warning-emphasis'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="View Details"
                            onClick={() => setViewingTest(t)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="Edit Mock Test"
                            onClick={() => openEditModal(t)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete / Archive"
                            onClick={() => setDeletingTest(t)}
                          >
                            <i className="bi bi-trash"></i>
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

        {totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
            <small className="text-muted">Showing {paginated.length} of {filtered.length} mock tests</small>
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
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold">
                  {editingTest ? 'Edit Mock Test' : 'Create New Mock Test'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
              </div>
              <form onSubmit={handleSaveTest}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 px-3 small mb-3">{formError}</div>}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Mock Test Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formState.title}
                        onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                        placeholder="e.g. CLF-C02 Practice Exam 2"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Exam Code & Certification</label>
                      <select
                        className="form-select"
                        value={formState.examCode}
                        onChange={(e) => handleCertSelect(e.target.value)}
                      >
                        {certifications.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} – {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Difficulty Level</label>
                      <select
                        className="form-select"
                        value={formState.difficulty}
                        onChange={(e) => setFormState({ ...formState, difficulty: e.target.value })}
                      >
                        <option value="Foundational">Foundational</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Duration (Min)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={5}
                        value={formState.durationMinutes}
                        onChange={(e) => setFormState({ ...formState, durationMinutes: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Total Questions</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        value={formState.totalQuestions}
                        onChange={(e) => setFormState({ ...formState, totalQuestions: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Benchmark (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={100}
                        value={formState.passingBenchmark}
                        onChange={(e) => setFormState({ ...formState, passingBenchmark: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Publication Status</label>
                      <select
                        className="form-select"
                        value={formState.status}
                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formState.description}
                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                        placeholder="Describe scope, domains covered, and target audience..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top py-2.5 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowFormModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingTest ? 'Update Mock Test' : 'Create Mock Test'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {viewingTest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold">{viewingTest.title}</h5>
                <button type="button" className="btn-close" onClick={() => setViewingTest(null)}></button>
              </div>
              <div className="modal-body p-4 small">
                <p className="text-secondary">{viewingTest.description || 'No description provided.'}</p>
                <div className="row g-2">
                  <div className="col-6"><strong>Certification:</strong> {viewingTest.certification}</div>
                  <div className="col-6"><strong>Exam Code:</strong> {viewingTest.examCode}</div>
                  <div className="col-6"><strong>Duration:</strong> {viewingTest.durationMinutes} mins</div>
                  <div className="col-6"><strong>Benchmark:</strong> {viewingTest.passingBenchmark}%</div>
                  <div className="col-6"><strong>Questions Linked:</strong> {getQuestionCountForTest(viewingTest.id)}</div>
                  <div className="col-6"><strong>Status:</strong> {viewingTest.status}</div>
                </div>
              </div>
              <div className="modal-footer border-top py-2 px-4 bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewingTest(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deletingTest)}
        title="Delete Mock Test?"
        message={`Are you sure you want to delete "${deletingTest?.title}"?`}
        warningText={
          deletingTest?.attemptsCount > 0
            ? `This mock test has ${deletingTest.attemptsCount} existing student attempt(s). Archiving is strongly recommended to preserve historical exam records.`
            : null
        }
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        secondaryActionLabel={deletingTest?.status !== 'Archived' ? 'Archive Instead' : null}
        onSecondaryAction={handleArchiveInstead}
        onCancel={() => setDeletingTest(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
