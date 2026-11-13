import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCertifications, getMockTests } from '../../services/mockTestService';

export default function CertificationsManagement() {
  const [certifications, setCertifications] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([getCertifications(), getMockTests({ includeDrafts: true })])
      .then(([certs, tests]) => {
        if (!ignore) {
          setCertifications(certs);
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
  }, []);

  return (
    <AdminLayout
      pageTitle="Certifications"
      pageSubtitle="AWS certification blueprints, domain weightages, and linked mock tests."
    >
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {certifications.map((cert) => {
            const linkedTests = mockTests.filter((t) => t.examCode === cert.code);
            return (
              <div key={cert.id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
                  <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary me-2">{cert.code}</span>
                      <span className="fw-bold text-dark">{cert.name}</span>
                    </div>
                    <span className={`badge ${cert.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-secondary small mb-3">{cert.description}</p>
                    <div className="d-flex justify-content-between align-items-center mb-2 small">
                      <strong className="text-dark">Official Exam Domains</strong>
                      <span className="text-muted">{linkedTests.length} Mock Test(s)</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {cert.domains.map((dom) => (
                        <div key={dom.name} className="d-flex justify-content-between align-items-center px-3 py-2 bg-light rounded border small">
                          <span className="text-dark fw-medium">{dom.name}</span>
                          <span className="badge bg-white text-secondary border">{dom.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

