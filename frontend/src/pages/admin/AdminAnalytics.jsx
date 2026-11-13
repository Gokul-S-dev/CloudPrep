import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/common/StatCard';
import DomainBarChart from '../../components/charts/DomainBarChart';
import LineTrendChart from '../../components/charts/LineTrendChart';
import { getAdminOverviewStats, getAllExamAttempts } from '../../services/adminService';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([getAdminOverviewStats(), getAllExamAttempts()])
      .then(([sData, aList]) => {
        if (!ignore) {
          setStats(sData);
          setAttempts(aList);
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

  const chronologicalScores = [...attempts]
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .map((att, idx) => ({
      label: `#${idx + 1}`,
      score: Math.round(Number(att.percentage || 0))
    }));

  const passRate =
    attempts.length > 0
      ? Math.round((attempts.filter((a) => a.benchmarkMet).length / attempts.length) * 100)
      : 0;

  return (
    <AdminLayout
      pageTitle="Platform Analytics"
      pageSubtitle="Global student performance trends, pass rates, and domain difficulty insights."
    >
      {isLoading || !stats ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Platform Pass Rate"
                value={`${passRate}%`}
                subtitle="Attempts meeting 70% benchmark"
                icon="bi-check-circle"
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Avg Student Score"
                value={`${stats.averageStudentScore}%`}
                subtitle="All evaluations"
                icon="bi-speedometer2"
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Attempts"
                value={stats.totalAttempts}
                subtitle="Completed submissions"
                icon="bi-clipboard-check"
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Active Question Bank"
                value={stats.totalQuestions}
                subtitle="Across all domains"
                icon="bi-database"
                color="secondary"
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Recent Submission Score Trend</h6>
                </div>
                <div className="card-body p-4">
                  <LineTrendChart data={chronologicalScores} emptyMessage="No attempt data yet." />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="mb-0 fw-bold text-dark">Domain Accuracy Across Candidates</h6>
                </div>
                <div className="card-body p-4">
                  <DomainBarChart items={stats.domainPerformance} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

