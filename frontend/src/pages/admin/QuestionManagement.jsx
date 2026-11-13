import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  validateQuestion,
  validateBulkImport,
  bulkImportQuestions
} from '../../services/questionService';
import { getMockTests, getCertifications } from '../../services/mockTestService';

const PAGE_SIZE = 8;

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const createEmptyQuestion = (tests = []) => ({
  question: '',
  certification: 'AWS Certified Cloud Practitioner',
  examCode: 'CLF-C02',
  mockTestId: tests[0]?.id || 'clf-c02-live',
  domain: 'Cloud Concepts',
  type: 'single',
  difficulty: 'Foundational',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ],
  correctAnswers: ['A'],
  explanation: '',
  status: 'Published'
});

export default function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [testFilter, setTestFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(createEmptyQuestion());
  const [formErrors, setFormErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Preview Modal
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Delete Modal
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [importValidation, setImportValidation] = useState(null);
  const [importTargetTest, setImportTargetTest] = useState('clf-c02-live');
  const [importFeedback, setImportFeedback] = useState('');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [qList, tList, cList] = await Promise.all([
        getAdminQuestions(),
        getMockTests({ includeDrafts: true }),
        getCertifications()
      ]);
      setQuestions(qList);
      setMockTests(tList);
      setCertifications(cList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getAdminQuestions(),
      getMockTests({ includeDrafts: true }),
      getCertifications()
    ])
      .then(([qList, tList, cList]) => {
        if (!ignore) {
          setQuestions(qList);
          setMockTests(tList);
          setCertifications(cList);
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

  const domainsList = Array.from(new Set(questions.map((q) => q.domain))).sort();

  const filtered = questions.filter((q) => {
    const matchesSearch =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(q.id).includes(searchQuery);
    const matchesDomain = domainFilter === 'all' || q.domain === domainFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesTest = testFilter === 'all' || q.mockTestId === testFilter;
    return matchesSearch && matchesDomain && matchesDiff && matchesTest;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Editor Handlers
  const openNewEditor = () => {
    setEditingId(null);
    setFormState(createEmptyQuestion(mockTests));
    setFormErrors([]);
    setShowEditor(true);
  };

  const openEditEditor = (q) => {
    setEditingId(q.id);
    setFormState({
      ...q,
      options: q.options.map((o) => ({ ...o })),
      correctAnswers: [...(q.correctAnswers || [])]
    });
    setFormErrors([]);
    setShowEditor(true);
  };

  const handleAddOption = () => {
    if (formState.options.length >= OPTION_LETTERS.length) return;
    const nextLetter = OPTION_LETTERS[formState.options.length];
    setFormState((prev) => ({
      ...prev,
      options: [...prev.options, { id: nextLetter, text: '' }]
    }));
  };

  const handleRemoveOption = (index) => {
    if (formState.options.length <= 2) return;
    const remaining = formState.options
      .filter((_, idx) => idx !== index)
      .map((opt, idx) => ({ ...opt, id: OPTION_LETTERS[idx] }));
    const validIds = new Set(remaining.map((o) => o.id));
    setFormState((prev) => ({
      ...prev,
      options: remaining,
      correctAnswers: prev.correctAnswers.filter((id) => validIds.has(id))
    }));
  };

  const handleOptionTextChange = (index, text) => {
    setFormState((prev) => {
      const updated = prev.options.map((opt, idx) =>
        idx === index ? { ...opt, text } : opt
      );
      return { ...prev, options: updated };
    });
  };

  const handleToggleCorrectAnswer = (optionId) => {
    setFormState((prev) => {
      if (prev.type === 'single') {
        return { ...prev, correctAnswers: [optionId] };
      }
      const exists = prev.correctAnswers.includes(optionId);
      const next = exists
        ? prev.correctAnswers.filter((id) => id !== optionId)
        : [...prev.correctAnswers, optionId];
      return { ...prev, correctAnswers: next };
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const errs = validateQuestion(formState);
    if (errs.length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSaving(true);
    setFormErrors([]);
    try {
      if (editingId !== null) {
        await updateAdminQuestion(editingId, formState);
      } else {
        await createAdminQuestion(formState);
      }
      setShowEditor(false);
      await loadAll();
    } catch (err) {
      setFormErrors([err.message || 'Failed to save question.']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    setIsDeleting(true);
    try {
      await deleteAdminQuestion(deletingQuestion.id);
      setDeletingQuestion(null);
      await loadAll();
    } finally {
      setIsDeleting(false);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const exportData = filtered.map((q) => ({
      id: q.id,
      domain: q.domain,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswers: q.correctAnswers,
      explanation: q.explanation
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cloudprep-questions-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Bulk Import Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result);
      setRawJsonText(content);
      runImportValidation(content);
    };
    reader.readAsText(file);
  };

  const runImportValidation = (jsonStr) => {
    setImportFeedback('');
    try {
      const parsed = JSON.parse(jsonStr);
      const res = validateBulkImport(parsed);
      setImportValidation(res);
    } catch (err) {
      setImportValidation({
        valid: false,
        validQuestions: [],
        errors: [{ questionId: 'JSON Syntax', messages: [err.message] }]
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!importValidation?.valid || importValidation.validQuestions.length === 0) return;
    const targetTest = mockTests.find((t) => t.id === importTargetTest);
    const result = await bulkImportQuestions(importValidation.validQuestions, {
      mode: 'append',
      mockTestId: importTargetTest,
      certification: targetTest?.certification,
      examCode: targetTest?.examCode
    });
    setImportFeedback(`Successfully imported ${result.importedCount} questions.`);
    setRawJsonText('');
    setImportValidation(null);
    setShowImportModal(false);
    await loadAll();
  };

  return (
    <AdminLayout
      pageTitle="Question Bank Management"
      pageSubtitle="Author, validate, preview, and bulk-manage certification questions."
      headerActions={
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-2.5 d-inline-flex align-items-center gap-1"
            onClick={handleExportJson}
          >
            <i className="bi bi-download"></i>
            <span className="d-none d-sm-inline">Export JSON</span>
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm px-2.5 d-inline-flex align-items-center gap-1"
            onClick={() => {
              setImportValidation(null);
              setRawJsonText('');
              setShowImportModal(true);
            }}
          >
            <i className="bi bi-upload"></i>
            <span className="d-none d-sm-inline">Bulk Import</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1"
            onClick={openNewEditor}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Question</span>
          </button>
        </div>
      }
    >
      {importFeedback && (
        <div className="alert alert-success py-2 px-3 small mb-3 d-flex align-items-center justify-content-between">
          <span><i className="bi bi-check-circle-fill me-2"></i>{importFeedback}</span>
          <button type="button" className="btn-close btn-sm" onClick={() => setImportFeedback('')}></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search question text or ID..."
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
                value={domainFilter}
                onChange={(e) => {
                  setDomainFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Domains</option>
                {domainsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Levels</option>
                <option value="Foundational">Foundational</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select form-select-sm"
                value={testFilter}
                onChange={(e) => {
                  setTestFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Mock Tests</option>
                {mockTests.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No questions found matching your filters.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase" style={{ fontSize: '0.73rem' }}>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Question</th>
                    <th>Domain</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((q) => (
                    <tr key={q.id}>
                      <td className="ps-4 fw-bold text-primary small">#{q.id}</td>
                      <td style={{ maxWidth: '420px' }}>
                        <div className="text-dark small fw-medium text-truncate">{q.question}</div>
                        <small className="text-muted">{q.examCode} • {q.difficulty}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{q.domain}</span>
                      </td>
                      <td className="small text-secondary">
                        {q.type === 'multiple' ? 'Multiple' : 'Single'}
                      </td>
                      <td>
                        <span className={`badge ${q.status === 'Published' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                          {q.status || 'Published'}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Preview Question"
                            onClick={() => setPreviewQuestion(q)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="Edit Question"
                            onClick={() => openEditEditor(q)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete Question"
                            onClick={() => setDeletingQuestion(q)}
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
            <small className="text-muted">Showing {paginated.length} of {filtered.length} questions</small>
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

      {/* Create / Edit Question Modal */}
      {showEditor && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold">
                  {editingId !== null ? `Edit Question #${editingId}` : 'Add New Question'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditor(false)}></button>
              </div>
              <form onSubmit={handleSaveQuestion} className="d-flex flex-column overflow-hidden">
                <div className="modal-body p-4 overflow-auto">
                  {formErrors.length > 0 && (
                    <div className="alert alert-danger py-2 px-3 small mb-3">
                      <strong>Validation Errors:</strong>
                      <ul className="mb-0 ps-3 mt-1">
                        {formErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Question Text</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formState.question}
                        onChange={(e) => setFormState({ ...formState, question: e.target.value })}
                        placeholder="Enter the AWS scenario or concept question..."
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Certification</label>
                      <select
                        className="form-select form-select-sm"
                        value={formState.examCode}
                        onChange={(e) => {
                          const cert = certifications.find((c) => c.code === e.target.value);
                          setFormState({
                            ...formState,
                            examCode: e.target.value,
                            certification: cert ? cert.name : formState.certification
                          });
                        }}
                      >
                        {certifications.map((c) => (
                          <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Mock Test</label>
                      <select
                        className="form-select form-select-sm"
                        value={formState.mockTestId}
                        onChange={(e) => setFormState({ ...formState, mockTestId: e.target.value })}
                      >
                        {mockTests.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">Domain</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formState.domain}
                        onChange={(e) => setFormState({ ...formState, domain: e.target.value })}
                        placeholder="e.g. Cloud Concepts"
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-semibold">Question Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={formState.type}
                        onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                      >
                        <option value="single">Single Choice</option>
                        <option value="multiple">Multiple Response</option>
                      </select>
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-semibold">Difficulty</label>
                      <select
                        className="form-select form-select-sm"
                        value={formState.difficulty}
                        onChange={(e) => setFormState({ ...formState, difficulty: e.target.value })}
                      >
                        <option value="Foundational">Foundational</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Options Builder */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-semibold mb-0">
                        Answer Options (Select Correct Answer{formState.type === 'multiple' ? 's' : ''})
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm py-0.5 px-2"
                        onClick={handleAddOption}
                        disabled={formState.options.length >= OPTION_LETTERS.length}
                      >
                        <i className="bi bi-plus"></i> Add Option
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {formState.options.map((opt, idx) => {
                        const isCorrect = formState.correctAnswers.includes(opt.id);
                        return (
                          <div key={opt.id} className="input-group input-group-sm">
                            <div className="input-group-text bg-light">
                              <input
                                type={formState.type === 'multiple' ? 'checkbox' : 'radio'}
                                name="correctOptionRadio"
                                checked={isCorrect}
                                onChange={() => handleToggleCorrectAnswer(opt.id)}
                                title="Mark as correct answer"
                              />
                            </div>
                            <span className="input-group-text fw-bold bg-white">{opt.id}</span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Option ${opt.id} text...`}
                              value={opt.text}
                              onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={formState.options.length <= 2}
                              onClick={() => handleRemoveOption(idx)}
                              title="Remove option"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-sm-8">
                      <label className="form-label small fw-semibold">Explanation</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        value={formState.explanation}
                        onChange={(e) => setFormState({ ...formState, explanation: e.target.value })}
                        placeholder="Provide AWS architectural explanation..."
                      />
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={formState.status}
                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2.5 px-4 bg-light d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPreviewQuestion(formState)}
                  >
                    <i className="bi bi-eye me-1"></i> Preview
                  </button>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditor(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.65)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-bold">Question Preview ({previewQuestion.domain})</h6>
                <button type="button" className="btn-close" onClick={() => setPreviewQuestion(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="fw-semibold text-dark mb-3">{previewQuestion.question || '(Empty question text)'}</p>
                <div className="d-flex flex-column gap-2 mb-3">
                  {previewQuestion.options.map((o) => {
                    const isCorrect = (previewQuestion.correctAnswers || []).includes(o.id);
                    return (
                      <div
                        key={o.id}
                        className={`p-2.5 rounded border small d-flex align-items-center justify-content-between ${
                          isCorrect ? 'bg-success-subtle border-success text-success fw-semibold' : 'bg-light'
                        }`}
                      >
                        <span><strong>{o.id}.</strong> {o.text || '(Empty option)'}</span>
                        {isCorrect && <span className="badge bg-success">Correct</span>}
                      </div>
                    );
                  })}
                </div>
                {previewQuestion.explanation && (
                  <div className="p-2.5 bg-light rounded border small text-secondary">
                    <strong>Explanation:</strong> {previewQuestion.explanation}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top py-2 px-4 bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreviewQuestion(null)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk JSON Import Modal */}
      {showImportModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(12, 35, 64, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered mx-3 mx-sm-auto">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold">Bulk Import Questions (JSON)</h5>
                <button type="button" className="btn-close" onClick={() => setShowImportModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Target Mock Test</label>
                    <select
                      className="form-select form-select-sm"
                      value={importTargetTest}
                      onChange={(e) => setImportTargetTest(e.target.value)}
                    >
                      {mockTests.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Upload JSON File</label>
                    <input type="file" accept=".json,application/json" className="form-control form-control-sm" onChange={handleFileUpload} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Or Paste Question JSON Array</label>
                  <textarea
                    className="form-control font-monospace small"
                    rows={6}
                    placeholder='[{"id": 1, "domain": "Cloud Concepts", "type": "single", "question": "...", "options": [{"id":"A","text":"..."}], "correctAnswers": ["A"], "explanation": "..."}]'
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => runImportValidation(rawJsonText)}
                    disabled={!rawJsonText.trim()}
                  >
                    <i className="bi bi-check2-square me-1"></i> Validate JSON
                  </button>
                </div>

                {importValidation && (
                  <div className="mt-3">
                    {importValidation.errors.length > 0 ? (
                      <div className="alert alert-danger small">
                        <strong>Import Validation Errors:</strong>
                        <ul className="mb-0 mt-1 ps-3">
                          {importValidation.errors.map((err, i) => (
                            <li key={i}>
                              <strong>Question {err.questionId}:</strong> {err.messages.join(' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="alert alert-success small">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <strong>Validation Passed!</strong> Ready to import{' '}
                        <strong>{importValidation.validQuestions.length}</strong> question(s).
                        <div className="mt-2 bg-white p-2 rounded border text-dark" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {importValidation.validQuestions.map((vq, idx) => (
                            <div key={idx} className="border-bottom py-1 small">
                              <strong>#{vq.id}:</strong> {vq.question} <span className="badge bg-light text-dark border">{vq.domain}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top py-2.5 px-4 bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4 fw-semibold"
                  disabled={!importValidation?.valid || importValidation.validQuestions.length === 0}
                  onClick={handleConfirmImport}
                >
                  Confirm & Save Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deletingQuestion)}
        title="Delete Question?"
        message={`Are you sure you want to delete Question #${deletingQuestion?.id}?`}
        warningText="This action cannot be undone and removes the question from the active question bank."
        confirmLabel="Delete Question"
        confirmVariant="danger"
        onCancel={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
