import React from 'react';

export default function LoginView({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  success,
  handleSignInSubmit,
  clearMessages,
  setView
}) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your customer portal</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSignInSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? <><div className="spinner"></div><span>Signing In...</span></> : 'Sign In →'}
        </button>
      </form>

      <p className="footer-text">
        Don't have an account yet?
        <span className="footer-link" onClick={() => { clearMessages(); setView('register'); }}>
          Register Now
        </span>
      </p>

      <p className="footer-text" style={{ marginTop: '0.5rem' }}>
        Already registered but need to verify your code?
        <span className="footer-link" onClick={() => { clearMessages(); setView('confirm'); }}>
          Verify Code
        </span>
      </p>
    </div>
  );
}
