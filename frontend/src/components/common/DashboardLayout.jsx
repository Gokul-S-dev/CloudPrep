import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from './ConfirmModal';

export default function DashboardLayout({
  portalTitle = 'Student Portal',
  navItems = [],
  pageTitle = 'Dashboard',
  pageSubtitle = '',
  headerActions = null,
  children
}) {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = (user?.fullName || 'CP')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderSidebarContent = (onItemClick) => (
    <div className="d-flex flex-column h-100 text-white">
      {/* Brand header */}
      <div className="px-3 py-3 border-bottom border-white border-opacity-10 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 flex-shrink-0"
            style={{ width: '36px', height: '36px' }}
          >
            <i className="bi bi-cloud-check-fill fs-5"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="fw-bold fs-5 text-white" style={{ letterSpacing: '-0.02em' }}>CloudPrep</span>
              <span className="pv-brand-badge">AWS</span>
            </div>
            <div className="text-white-50" style={{ fontSize: '0.7rem' }}>{portalTitle}</div>
          </div>
        </div>
        {onItemClick && (
          <button
            type="button"
            className="btn-close btn-close-white d-lg-none"
            aria-label="Close navigation"
            onClick={onItemClick}
          ></button>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-grow-1 overflow-auto py-3 px-2">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 fw-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-white-50 hover-nav-item'
                  }`
                }
                style={{ fontSize: '0.92rem' }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="badge bg-white bg-opacity-20 text-white ms-auto rounded-pill" style={{ fontSize: '0.7rem' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom user summary & logout */}
      <div className="p-3 border-top border-white border-opacity-10">
        <div className="d-flex align-items-center gap-2.5 mb-3 px-1">
          <div
            className="rounded-circle bg-info text-dark fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-grow-1">
            <div className="text-white fw-semibold small text-truncate">{user?.fullName}</div>
            <div className="text-white-50 text-truncate" style={{ fontSize: '0.72rem' }}>{user?.email}</div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          onClick={() => setShowLogoutModal(true)}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="d-flex min-vh-100 w-100 bg-light">
      {/* Desktop Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column flex-shrink-0 sticky-top vh-100"
        style={{ width: '260px', backgroundColor: '#0c2340', zIndex: 1020 }}
      >
        {renderSidebarContent(null)}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-palette-backdrop d-lg-none"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`d-lg-none position-fixed top-0 bottom-0 start-0 ${mobileMenuOpen ? 'translate-0' : ''}`}
        style={{
          width: '270px',
          backgroundColor: '#0c2340',
          zIndex: 1050,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease'
        }}
      >
        {renderSidebarContent(() => setMobileMenuOpen(false))}
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-w-0">
        {/* Topbar */}
        <header className="bg-white border-bottom sticky-top px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between gap-3" style={{ zIndex: 1010, minHeight: '64px' }}>
          <div className="d-flex align-items-center gap-2.5 min-w-0">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-lg-none"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="min-w-0">
              <h1 className="h5 fw-bold text-dark mb-0 text-truncate">{pageTitle}</h1>
              {pageSubtitle && (
                <small className="text-muted d-none d-sm-block text-truncate">{pageSubtitle}</small>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {isDemoMode && (
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1.5 d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-eye-fill"></i>
                <span>Demo Preview Mode</span>
              </span>
            )}
            {headerActions}
          </div>
        </header>

        {/* Page body */}
        <main className="flex-grow-1 p-3 p-md-4">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        show={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to sign out of your CloudPrep session?"
        confirmLabel="Yes, Sign Out"
        confirmVariant="danger"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </div>
  );
}

