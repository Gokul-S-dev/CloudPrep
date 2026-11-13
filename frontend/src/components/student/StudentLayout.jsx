import DashboardLayout from '../common/DashboardLayout';

const STUDENT_NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Overview', icon: 'bi-speedometer2' },
  { to: '/student/tests', label: 'Explore Mock Tests', icon: 'bi-journal-code' },
  { to: '/student/history', label: 'My Exams & History', icon: 'bi-clock-history' },
  { to: '/student/performance', label: 'Performance Analytics', icon: 'bi-graph-up-arrow' },
  { to: '/student/profile', label: 'My Profile', icon: 'bi-person-circle' },
  { to: '/student/settings', label: 'Settings', icon: 'bi-gear' }
];

export default function StudentLayout({ pageTitle, pageSubtitle, headerActions, children }) {
  return (
    <DashboardLayout
      portalTitle="Student Portal"
      navItems={STUDENT_NAV_ITEMS}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      headerActions={headerActions}
    >
      {children}
    </DashboardLayout>
  );
}

