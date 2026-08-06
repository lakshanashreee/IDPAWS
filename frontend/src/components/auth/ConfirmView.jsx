import React, { useState, useEffect } from 'react';

export default function ConfirmView({
  email,
  setEmail,
  code,
  setCode,
  loading,
  error,
  success,
  handleConfirmSubmit,
  handleResendCode,
  clearMessages,
  setView
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setConfirmLoading(false);
      setResendLoading(false);
    }
  }, [loading]);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Verify Email</h2>
      <p className="auth-subtitle">Enter the code sent to {email}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={(e) => { setConfirmLoading(true); handleConfirmSubmit(e); }}>
        <div className="form-group">
          <label htmlFor="confirm-email">Email Address</label>
          <input
            type="email"
            id="confirm-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="verification-code">Verification Code</label>
          <input
            type="text"
            id="verification-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {confirmLoading ? <><div className="spinner"></div><span>Confirming...</span></> : 'Confirm Account →'}
        </button>
      </form>

      <button 
        type="button" 
        className="btn-primary btn-secondary" 
        onClick={(e) => { setResendLoading(true); handleResendCode(e); }}
        disabled={loading}
        style={{ width: '100%', marginTop: '0.75rem' }}
      >
        {resendLoading ? <><div className="spinner"></div><span>Resending...</span></> : 'Resend Verification Code'}
      </button>

      <p className="footer-text">
        Want to try logging in?
        <span className="footer-link" onClick={() => { clearMessages(); setView('login'); }}>
          Go to Sign In
        </span>
      </p>
    </div>
  );
}
