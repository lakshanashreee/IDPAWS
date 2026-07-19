import React from 'react';

export default function NewPasswordView({
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  loading,
  error,
  success,
  handleNewPasswordSubmit
}) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Update Password</h2>
      <p className="auth-subtitle">Configure a new password for first-time use</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleNewPasswordSubmit}>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            type="password"
            id="confirm-new-password"
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? <><div className="spinner"></div><span>Setting Password...</span></> : 'Set Password & Log In →'}
        </button>
      </form>
    </div>
  );
}
