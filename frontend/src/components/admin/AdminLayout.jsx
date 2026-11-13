import DashboardLayout from '../common/DashboardLayout';

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: 'bi-speedometer2' },
  { to: '/admin/mock-tests', label: 'Mock Test Management', icon: 'bi-collection' },
  { to: '/admin/questions', label: 'Question Bank', icon: 'bi-database-gear' },
  { to: '/admin/certifications', label: 'Certifications', icon: 'bi-award' },
  { to: '/admin/students', label: 'Student Management', icon: 'bi-people' },
  { to: '/admin/attempts', label: 'Exam Attempts', icon: 'bi-clipboard-data' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'bi-bar-chart-line' },
  { to: '/admin/settings', label: 'Settings', icon: 'bi-sliders' }
];

export default function AdminLayout({ pageTitle, pageSubtitle, headerActions, children }) {
  return (
    <DashboardLayout
      portalTitle="Admin Management"
      navItems={ADMIN_NAV_ITEMS}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      headerActions={headerActions}
    >
      {children}
    </DashboardLayout>
  );
}

