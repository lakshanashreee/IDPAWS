import React from 'react';

export default function InvoiceModal({ selectedOrderForInvoice, setSelectedOrderForInvoice }) {
  if (!selectedOrderForInvoice) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={() => setSelectedOrderForInvoice(null)}>
      <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0, color: '#1c1917' }}>Official Tax Invoice</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn-primary btn-gold" onClick={() => window.print()} style={{ margin: 0, padding: '0.45rem 1.1rem', fontSize: '0.82rem', width: 'auto' }}>
              Print / Save PDF
            </button>
            <button type="button" className="btn-primary btn-secondary" onClick={() => setSelectedOrderForInvoice(null)} style={{ margin: 0, padding: '0.45rem 0.9rem', width: 'auto' }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ color: '#1c1917', background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: 0, color: '#1c1917' }}>LAURITE HAUTE COUTURE</h1>
              <p style={{ margin: '0.2rem 0', color: '#57534e', fontSize: '0.82rem' }}>Luxury Global E-Commerce</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#57534e' }}>INVOICE</h2>
              <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#1c1917' }}><strong>Order ID:</strong> {selectedOrderForInvoice.orderId}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#57534e' }}><strong>Date:</strong> {new Date(selectedOrderForInvoice.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#57534e', fontSize: '0.85rem' }}>Customer Details:</h4>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#1c1917' }}>{selectedOrderForInvoice.userId}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ margin: 0, color: '#57534e', fontSize: '0.85rem' }}>Payment Info:</h4>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#10b981' }}>{selectedOrderForInvoice.paymentMode || 'COD'} ({selectedOrderForInvoice.paymentStatus || 'SUCCESS'})</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.65rem', textAlign: 'left', color: '#475569' }}>Item Description</th>
                <th style={{ padding: '0.65rem', textAlign: 'right', color: '#475569' }}>Unit Price</th>
                <th style={{ padding: '0.65rem', textAlign: 'center', color: '#475569' }}>Qty</th>
                <th style={{ padding: '0.65rem', textAlign: 'right', color: '#475569' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderForInvoice.items && selectedOrderForInvoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem', fontWeight: 600, color: '#1c1917' }}>{item.productName}</td>
                  <td style={{ padding: '0.65rem', textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 700 }}>₹{Number(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <div style={{ width: '240px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>
                <span>Subtotal</span>
                <span>₹{Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#1c1917', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span>Grand Total</span>
                <span>₹{Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
