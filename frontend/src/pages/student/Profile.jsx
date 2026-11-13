import { useState } from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { updateStudentProfile } from '../../services/studentService';
import { changePassword } from '../../services/authService';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [course, setCourse] = useState(user?.course || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '2026');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const initials = (user?.fullName || 'CP')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setProfileMsg({ type: 'danger', text: 'Profile image must be under 1 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!fullName.trim()) {
      setProfileMsg({ type: 'danger', text: 'Full name cannot be empty.' });
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateStudentProfile({
        fullName,
        institution,
        course,
        graduationYear,
        avatarUrl
      });
      updateUserProfile(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.message || 'Unable to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass.length < 8) {
      setPassMsg({ type: 'danger', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'danger', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(user?.email, currentPass, newPass);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPassMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <StudentLayout
      pageTitle="My Profile"
      pageSubtitle="Manage your personal information, academic details, and account security."
    >
      <div className="row g-4">
        {/* Left column: Summary Card + Profile Form */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '14px' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-bold text-dark">Personal & Academic Details</h6>
            </div>
            <div className="card-body p-4">
              {/* Avatar Row */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4 pb-3 border-bottom">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.fullName}
                    className="rounded-circle object-fit-cover border"
                    style={{ width: '72px', height: '72px' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center fs-4"
                    style={{ width: '72px', height: '72px' }}
                  >
                    {initials}
                  </div>
                )}

                <div className="flex-grow-1">
                  <h5 className="fw-bold text-dark mb-0">{user?.fullName}</h5>
                  <div className="text-muted small mb-2">{user?.email}</div>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <label className="btn btn-outline-primary btn-sm mb-0 cursor-pointer">
                      <i className="bi bi-camera me-1"></i> Upload Photo
                      <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                    </label>
                    <span className="badge bg-light text-secondary border">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                    </span>
                  </div>
                </div>
              </div>

              {profileMsg && (
                <div className={`alert alert-${profileMsg.type} py-2 px-3 small mb-3`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-dark">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">College / Institution</label>
                    <input
                      type="text"
                      className="form-control"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                    />
                  </div>
                  <div className="col-12 col-sm-7">
                    <label className="form-label small fw-semibold text-dark">Course / Major</label>
                    <input
                      type="text"
                      className="form-control"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                    />
                  </div>
                  <div className="col-12 col-sm-5">
                    <label className="form-label small fw-semibold text-dark">Graduation Year</label>
                    <input
                      type="text"
                      className="form-control"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right column: Change Password */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '14px' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="bi bi-shield-lock me-2 text-primary"></i>
                Change Password
              </h6>
            </div>
            <div className="card-body p-4">
              {passMsg && (
                <div className={`alert alert-${passMsg.type} py-2 px-3 small mb-3`}>
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-primary w-100 fw-semibold"
                  disabled={isChangingPass}
                >
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

