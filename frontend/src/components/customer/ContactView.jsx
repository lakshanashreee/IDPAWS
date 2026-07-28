import React, { useState } from 'react';
import { IconUser, IconInvoice } from '../common/Icons';

export default function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="contact-page-container screen-container">
      {/* Header */}
      <section className="contact-hero-section">
        <span className="contact-label">CONCIERGE & SUPPORT</span>
        <h1 className="contact-title">We are at Your Service</h1>
        <p className="contact-subtitle">
          Have a question about a product, order status, or bespoke inquiries? 
          Our luxury concierge team is available 24/7.
        </p>
      </section>

      <div className="contact-grid">
        {/* Contact Info Card */}
        <div className="contact-info-card">
          <h2 className="info-title">Contact Details</h2>
          <p className="info-desc">
            Reach out via any of the options below, or submit the concierge contact form.
          </p>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div>
                <strong>Boutique Flagship</strong>
                <p>LAURITE Haute Couture Flagship Store, Luxury Avenue, Singapore 018956</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>
              <div>
                <strong>Concierge Line</strong>
                <p>+65 6789 1234 (Available 24/7)</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div>
                <strong>Client Services Email</strong>
                <p>concierge@laurite.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🕒</div>
              <div>
                <strong>Operating Hours</strong>
                <p>Mon - Sun: 09:00 AM - 10:00 PM SGT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="contact-form-card">
          <h2 className="form-title">Send Us a Message</h2>

          {submitted ? (
            <div className="contact-success-msg">
              <h3>Thank You!</h3>
              <p>Your message has been received. Our concierge team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  placeholder="Order Inquiry / Product Question"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea 
                  rows="5"
                  placeholder="How can our concierge assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary btn-gold" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}>
                SEND MESSAGE →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
