import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserProfile, updateUserProfile } from '../../utils/api';
import './ProfileView.css';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

const ProfileView = ({ userSession, handleLogout }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    photoBase64: '',
    addresses: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ tag: 'Home', addressLine: '' });

  const getCognitoName = () => {
    return userSession?.payload?.name || userSession?.payload?.['cognito:username'] || '';
  };

  const fetchProfile = useCallback(async () => {
    if (!userSession) return;
    setLoading(true);
    try {
      const data = await getUserProfile(userSession.payload.sub);
      if (data) {
        setProfile({
          name: data.name || getCognitoName(),
          email: data.email || userSession.payload.email || '',
          photoBase64: data.photoUrl || data.profilePhotoUrl || '', 
          addresses: data.addresses || []
        });
      } else {
        setProfile(prev => ({ ...prev, email: userSession.payload.email || '', name: getCognitoName() }));
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED' && handleLogout) {
        handleLogout();
        return;
      }
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setProfile(prev => ({ ...prev, email: userSession.payload.email || '', name: getCognitoName() }));
      } else {
        console.error(err);
        setError('Could not load profile data.');
      }
    } finally {
      setLoading(false);
    }
  }, [userSession, handleLogout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(userSession.payload.sub, {
        name: profile.name,
        photoUrl: profile.photoBase64,
        addresses: profile.addresses
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setIsNameEditing(false);
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000); // clear success message after 3s
    } catch (err) {
      if (err.message === 'UNAUTHORIZED' && handleLogout) {
        handleLogout();
        return;
      }
      console.error(err);
      setError('Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoBase64: reader.result }));
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addAddress = () => {
    if (!newAddress.addressLine.trim()) return;
    setProfile(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
    setNewAddress({ tag: 'Home', addressLine: '' });
    setIsAddressModalOpen(false);
    setIsEditing(true);
  };

  const removeAddress = (index) => {
    setProfile(prev => {
      const newAddresses = [...prev.addresses];
      newAddresses.splice(index, 1);
      return { ...prev, addresses: newAddresses };
    });
    setIsEditing(true);
  };

  return (
    <div className="profile-wrapper animate-fade-in">
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          {isEditing && (
            <button className="btn-primary profile-save-btn" onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="profile-top-section">
          <div 
            className="profile-photo-wrapper"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileDrop} 
              accept="image/*"
            />
            {profile.photoBase64 ? (
              <img src={profile.photoBase64} alt="Profile" className="profile-photo" />
            ) : (
              <div className="profile-photo-placeholder">
                <span>+<br/>Upload</span>
              </div>
            )}
            <div className="photo-overlay">Change</div>
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <span className="field-label">NAME</span>
              <div className="name-edit-wrapper">
                {isNameEditing ? (
                  <input 
                    type="text" 
                    className="editable-input name-input"
                    value={profile.name} 
                    autoFocus
                    onBlur={() => setIsNameEditing(false)}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, name: e.target.value }));
                      setIsEditing(true);
                    }}
                  />
                ) : (
                  <div className="name-display">
                    <h3>{profile.name || 'Set your name'}</h3>
                    <button className="icon-btn" onClick={() => setIsNameEditing(true)}>
                      <EditIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <span className="field-label">EMAIL</span>
              <p className="email-display">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="addresses-section">
          <div className="section-title-wrapper">
            <h3>Shipping Addresses</h3>
            <button className="add-address-link" onClick={() => setIsAddressModalOpen(true)}>
              + Add Address
            </button>
          </div>
          
          <div className="addresses-grid">
            {profile.addresses.length === 0 ? (
              <div className="empty-address-card" onClick={() => setIsAddressModalOpen(true)}>
                <p>No addresses added. Click to add one.</p>
              </div>
            ) : (
              profile.addresses.map((addr, idx) => (
                <div key={idx} className="address-card">
                  <div className="address-card-header">
                    <span className="address-tag">{addr.tag}</span>
                    <button className="address-delete-btn" onClick={() => removeAddress(idx)}>Remove</button>
                  </div>
                  <p className="address-text">{addr.addressLine}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {isAddressModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
              <h3>New Address</h3>
              <div className="form-group">
                <label>Address Tag</label>
                <div className="tag-selector">
                  {['Home', 'Work', 'Other'].map(tag => (
                    <button 
                      key={tag}
                      className={`tag-btn ${newAddress.tag === tag ? 'active' : ''}`}
                      onClick={() => setNewAddress({...newAddress, tag})}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Address Details</label>
                <textarea 
                  rows="3" 
                  value={newAddress.addressLine} 
                  onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})}
                  placeholder="e.g. 123 Fashion Ave, Suite 400"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={addAddress} disabled={!newAddress.addressLine.trim()}>Add Address</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
