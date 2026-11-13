import { useEffect, useState } from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import StatCard from '../../components/common/StatCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import DomainBarChart from '../../components/charts/DomainBarChart';
import { useAuth } from '../../context/AuthContext';
import { getStudentExamHistory, computeStudentAnalytics } from '../../services/studentService';

export default function Performance() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const analytics = computeStudentAnalytics(attempts);

  const totalAnswered = analytics.totalCorrect + analytics.totalIncorrect;
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((analytics.totalCorrect / totalAnswered) * 100) : 0;

  return (
    <StudentLayout
      pageTitle="Performance Analytics"
      pageSubtitle="Deep insights derived directly from your recorded AWS certification attempts."
    >
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Overall Accuracy"
                value={`${overallAccuracy}%`}
                subtitle={`${analytics.totalCorrect} correct / ${analytics.totalIncorrect} wrong`}
                icon="bi-bullseye"
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Average Exam Score"
                value={`${analytics.averageScore}%`}
                subtitle={`Across ${analytics.totalExams} attempt(s)`}
                icon="bi-graph-up-arrow"
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Strongest Domain"
                value={analytics.strongestDomains[0]?.domain?.split(' ')[0] || 'N/A'}
                subtitle={
                  analytics.strongestDomains[0]
                    ? `${analytics.strongestDomains[0].accuracy}% mastery`
                    : 'Attempt an exam first'
                }
                icon="bi-award"
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Focus Domain"
                value={analytics.weakestDomains[0]?.domain?.split(' ')[0] || 'On Track'}
                subtitle={
                  analytics.weakestDomains[0]
                    ? `${analytics.weakestDomains[0].accuracy}% accuracy`
                    : 'All domains ≥75%'
                }
                icon="bi-lightbulb"
                color="warning"
              />
            </div>
          </div>

          {/* Charts */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Score Progression Over Time</h6>
                </div>
                <div className="card-body p-4">
                  <LineTrendChart
                    data={analytics.scoreProgression}
                    emptyMessage="No completed exam attempts to plot progression yet."
                  />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Correct vs Incorrect Breakdown</h6>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                  {analytics.totalExams === 0 ? (
                    <div className="text-center text-muted small py-4">
                      Complete an exam to see answer distribution.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span className="text-success">Correct ({analytics.totalCorrect})</span>
                          <span className="text-danger">Incorrect ({analytics.totalIncorrect})</span>
                          <span className="text-secondary">Skipped ({analytics.totalUnanswered})</span>
                        </div>
                        <div className="progress" style={{ height: '18px', borderRadius: '8px' }}>
                          {(() => {
                            const grandTotal =
                              analytics.totalCorrect + analytics.totalIncorrect + analytics.totalUnanswered || 1;
                            const pCorrect = (analytics.totalCorrect / grandTotal) * 100;
                            const pWrong = (analytics.totalIncorrect / grandTotal) * 100;
                            const pSkip = (analytics.totalUnanswered / grandTotal) * 100;
                            return (
                              <>
                                <div className="progress-bar bg-success" style={{ width: `${pCorrect}%` }}></div>
                                <div className="progress-bar bg-danger" style={{ width: `${pWrong}%` }}></div>
                                <div className="progress-bar bg-secondary" style={{ width: `${pSkip}%` }}></div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="row g-2 text-center small">
                        <div className="col-4">
                          <div className="p-2 bg-success-subtle text-success rounded-3 fw-bold">
                            {analytics.totalCorrect}
                            <div className="fw-normal" style={{ fontSize: '0.7rem' }}>Correct</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 bg-danger-subtle text-danger rounded-3 fw-bold">
                            {analytics.totalIncorrect}
                            <div className="fw-normal" style={{ fontSize: '0.7rem' }}>Incorrect</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 bg-secondary-subtle text-secondary rounded-3 fw-bold">
                            {analytics.totalUnanswered}
                            <div className="fw-normal" style={{ fontSize: '0.7rem' }}>Skipped</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Domain Mastery & Improvement Suggestions */}
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Domain-Wise Accuracy</h6>
                </div>
                <div className="card-body p-4">
                  <DomainBarChart items={analytics.domainBreakdown} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-compass text-primary me-2"></i>
                    Suggested Areas for Improvement
                  </h6>
                </div>
                <div className="card-body p-4">
                  {analytics.totalExams === 0 ? (
                    <div className="text-muted small">
                      Recommendations will appear automatically based on your domain scores after completing your first mock exam.
                    </div>
                  ) : analytics.suggestedImprovements.length === 0 ? (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                      <i className="bi bi-check-circle-fill fs-5"></i>
                      <div className="small">
                        <strong>Strong Performance!</strong> All evaluated AWS domains are currently at or above 75% accuracy.
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {analytics.suggestedImprovements.map((item) => (
                        <div key={item.domain} className="p-3 border rounded-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark small">{item.domain}</span>
                            <span className="badge bg-warning-subtle text-warning-emphasis">{item.accuracy}% Accuracy</span>
                          </div>
                          <p className="text-secondary small mb-0">{item.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </StudentLayout>
  );
}

