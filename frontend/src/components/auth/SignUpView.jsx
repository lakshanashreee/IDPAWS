import React from 'react';

export default function SignUpView({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  error,
  handleSignUpSubmit,
  clearMessages,
  setView
}) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Create Account</h2>
      <p className="auth-subtitle">Register as a valued LAURITE customer</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSignUpSubmit}>
        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <input
            type="text"
            id="reg-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            type="email"
            id="reg-email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            type="password"
            id="reg-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            type="password"
            id="reg-confirm-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? <><div className="spinner"></div><span>Registering...</span></> : 'Register Account →'}
        </button>
      </form>

      <p className="footer-text">
        Already have an account?
        <span className="footer-link" onClick={() => { clearMessages(); setView('login'); }}>
          Sign In
        </span>
      </p>
    </div>
  );
}
