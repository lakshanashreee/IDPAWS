import React, { useState, useEffect } from 'react';
import { IconUser } from '../common/Icons';
import { getUserProfile, updateUserProfile } from '../../utils/api';

export default function CustomerProfile({ userSession }) {
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    street: '',
    city: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      if (userSession && userSession.payload.sub) {
        try {
          const profile = await getUserProfile(userSession.payload.sub);
          if (profile && profile.addresses) {
            setAddresses(profile.addresses);
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      }
    }
    fetchProfile();
  }, [userSession]);

  const saveAddresses = async (newAddrs) => {
    if (userSession && userSession.payload.sub) {
      try {
        const userId = userSession.payload.sub;
        const profileData = {
          userId,
          email: userSession.payload.email,
          name: userSession.payload.name || 'Customer',
          addresses: newAddrs
        };
        await updateUserProfile(userId, profileData);
        setAddresses(newAddrs);
      } catch (err) {
        alert('Failed to save address: ' + err.message);
      }
    } else {
      setAddresses(newAddrs);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const updated = [...addresses, { ...newAddress, id: Date.now().toString() }];
    saveAddresses(updated);
    setIsAdding(false);
    setNewAddress({ title: '', name: '', street: '', city: '', zip: '', country: '' });
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    saveAddresses(updated);
  };

  const email = userSession?.payload?.email || '';
  const name = userSession?.payload?.name || 'Customer';

  return (
    <div className="screen-container animate-fade-in" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>My Profile</h2>
      
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '50%', color: 'var(--accent-gold)' }}>
          <IconUser />
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{name}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Address Book</h3>
        <button className="btn-primary" onClick={() => setIsAdding(!isAdding)} style={{ padding: '0.5rem 1.5rem', width: 'auto' }}>
          {isAdding ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAddress} style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Address Title (e.g., Home, Work)</label>
              <input className="premium-input" required type="text" placeholder="e.g. Home" value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input className="premium-input" required type="text" placeholder="John Doe" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Street Address</label>
              <input className="premium-input" required type="text" placeholder="123 Luxury Lane" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>City</label>
              <input className="premium-input" required type="text" placeholder="New York" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ZIP / Postal Code</label>
              <input className="premium-input" required type="text" placeholder="10001" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Country</label>
              <input className="premium-input" required type="text" placeholder="United States" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Address</button>
        </form>
      )}

      {addresses.length === 0 && !isAdding ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px dashed rgba(212,197,185,0.8)' }}>
          <p style={{ color: 'var(--text-muted)' }}>You have no saved addresses.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold' }}>{addr.title}</span>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{addr.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                {addr.street}<br/>
                {addr.city}, {addr.zip}<br/>
                {addr.country}
              </p>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', padding: '0.5rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}
                onClick={() => handleDeleteAddress(addr.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
