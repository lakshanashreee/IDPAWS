import React from 'react';

export default function LandingPage({ setView }) {
  return (
    <div className="landing-page animate-fade-in" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div className="brand-logo-center" style={{ marginBottom: '1rem', fontSize: '4rem' }}>
        <span className="brand-initial-l">L</span>AURITE
      </div>
      <span className="brand-tag-sub" style={{ display: 'block', marginBottom: '3rem', fontSize: '1.2rem', letterSpacing: '8px' }}>HAUTE COUTURE</span>
      
      <p style={{ maxWidth: '600px', margin: '0 auto 3rem auto', color: 'var(--text-muted)', lineHeight: '1.8' }}>
        Experience the pinnacle of luxury fashion. Discover our exclusive collection of meticulously crafted pieces designed to elevate your everyday elegance.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
        <button 
          className="btn-primary" 
          onClick={() => setView('login')}
          style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
        >
          Sign In
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => setView('register')}
          style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
