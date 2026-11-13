import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/student/StudentLayout';
import { getCertifications, getMockTests } from '../../services/mockTestService';
import { getStudentExamHistory } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

export default function ExploreTests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [certifications, setCertifications] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedCert, setSelectedCert] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getCertifications(),
      getMockTests({ includeDrafts: false }),
      getStudentExamHistory(user)
    ])
      .then(([certs, tests, hist]) => {
        if (!ignore) {
          setCertifications(certs);
          setMockTests(tests);
          setAttempts(hist);
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

  const getStudentAttemptsForTest = (testId) => {
    return attempts.filter((a) => a.mockTestId === testId).length;
  };

  const filteredTests = mockTests.filter((test) => {
    const matchesCert = selectedCert === 'ALL' || test.examCode === selectedCert;
    const matchesQuery =
      !searchQuery.trim() ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.examCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.certification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCert && matchesQuery;
  });

  return (
    <StudentLayout
      pageTitle="Explore Mock Tests"
      pageSubtitle="Browse official AWS certification mock exams and practice drills."
    >
      {/* Certification Filter Pills */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3 p-sm-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by exam title or code (e.g. CLF-C02)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-7">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <button
                  type="button"
                  className={`btn btn-sm ${selectedCert === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCert('ALL')}
                >
                  All Certifications
                </button>
                {certifications.map((cert) => (
                  <button
                    key={cert.id}
                    type="button"
                    className={`btn btn-sm ${selectedCert === cert.code ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedCert(cert.code)}
                  >
                    {cert.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* Available Published Mock Tests */}
          <h5 className="fw-bold text-dark mb-3">Available Practice Examinations</h5>
          <div className="row g-4 mb-5">
            {filteredTests.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm p-5 text-center text-muted">
                  <i className="bi bi-journal-x fs-1 mb-2"></i>
                  <p className="mb-0">No published mock tests match your search filters.</p>
                </div>
              </div>
            ) : (
              filteredTests.map((test) => {
                const userAttempts = getStudentAttemptsForTest(test.id);
                return (
                  <div key={test.id} className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-primary px-2.5 py-1.5">{test.examCode}</span>
                          <div className="d-flex gap-1.5">
                            {test.usesLiveApi && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                <i className="bi bi-cloud-check me-1"></i>Live AWS API
                              </span>
                            )}
                            <span className="badge bg-light text-secondary border">{test.difficulty}</span>
                          </div>
                        </div>

                        <div className="text-muted small fw-semibold mb-1">{test.certification}</div>
                        <h5 className="fw-bold text-dark mb-2">{test.title}</h5>
                        <p className="text-secondary small mb-4 flex-grow-1">{test.description}</p>

                        <div className="row g-2 text-center bg-light rounded-3 p-2.5 mb-3 small">
                          <div className="col-4 border-end">
                            <div className="fw-bold text-dark">{test.totalQuestions}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Questions</div>
                          </div>
                          <div className="col-4 border-end">
                            <div className="fw-bold text-dark">{test.durationMinutes}m</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Duration</div>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-dark">{userAttempts}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Your Attempts</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => navigate(`/exam/${test.id}`)}
                        >
                          <span>Start Exam</span>
                          <i className="bi bi-arrow-right-circle"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Upcoming / Scalable Certification Catalogue */}
          <h5 className="fw-bold text-dark mb-3">AWS Certification Tracks Roadmap</h5>
          <div className="row g-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                  <div className="card-body p-3 p-sm-4 d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <i className="bi bi-award-fill fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">{cert.name}</span>
                        <span
                          className={`badge ${
                            cert.status === 'Active'
                              ? 'bg-success-subtle text-success'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </div>
                      <div className="small text-muted mb-2">
                        {cert.code} • {cert.level} • {cert.domains.length} Domains
                      </div>
                      <p className="small text-secondary mb-0">{cert.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </StudentLayout>
  );
}

