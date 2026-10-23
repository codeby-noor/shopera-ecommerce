import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, usersAPI } from '../services/api';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'security'

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || ''
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await usersAPI.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    try {
      setUpdatingProfile(true);
      const res = await authAPI.updateProfile(profileForm);
      if (res.data.success) {
        updateUserProfile(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.response?.data?.message || 'Password update failed.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      full_name: user?.name || '',
      phone: user?.phone || '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      is_default: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      street_address: addr.street_address,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country || 'United States',
      is_default: addr.is_default === 1
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await usersAPI.updateAddress(editingAddressId, addressForm);
      } else {
        await usersAPI.addAddress(addressForm);
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await usersAPI.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await usersAPI.setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not set default address.');
    }
  };

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bold mb-1">Customer Profile</h1>
        <p className="text-muted small mb-0">Manage your contact credentials and shipping preferences</p>
      </div>

      <div className="row g-4">
        {/* Left Profile Summary Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center mb-4 bg-white">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="rounded-circle mx-auto mb-3 border shadow-sm"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <h4 className="fw-bold mb-1 text-dark">{user?.name}</h4>
            <p className="text-muted small mb-2">{user?.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className={`badge ${user?.role === 'admin' ? 'bg-primary' : 'bg-secondary'} rounded-pill text-capitalize px-3 py-2`}>
                {user?.role} Account
              </span>
            </div>
            <small className="text-muted d-block border-top pt-3">
              Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
            </small>
          </div>

          {/* Navigation Pills */}
          <div className="list-group rounded-4 shadow-sm border-0 overflow-hidden">
            <button
              className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${
                activeTab === 'profile' ? 'active bg-primary' : ''
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person-gear me-2"></i>Account Details
            </button>
            <button
              className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${
                activeTab === 'addresses' ? 'active bg-primary' : ''
              }`}
              onClick={() => setActiveTab('addresses')}
            >
              <i className="bi bi-geo-alt me-2"></i>Saved Addresses
            </button>
            <button
              className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${
                activeTab === 'security' ? 'active bg-primary' : ''
              }`}
              onClick={() => setActiveTab('security')}
            >
              <i className="bi bi-shield-lock me-2"></i>Security & Password
            </button>
          </div>
        </div>

        {/* Right Details Container */}
        <div className="col-lg-8">
          {/* 1. Account Details Tab */}
          {activeTab === 'profile' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-4">Edit Personal Information</h5>

              {profileMsg.text && (
                <div className={`alert alert-${profileMsg.type} rounded-3 py-2 small mb-3`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address (Locked)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Avatar Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={profileForm.avatar_url}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-shopera-primary rounded-pill px-4"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Delivery Addresses</h5>
                <button
                  className="btn btn-shopera-primary btn-sm rounded-pill"
                  onClick={handleOpenAddAddress}
                >
                  <i className="bi bi-plus-lg me-1"></i>Add New Address
                </button>
              </div>

              {loadingAddresses ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-geo-alt fs-1 mb-2 d-block"></i>
                  <p>No addresses saved yet. Add your preferred delivery address.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="col-md-6">
                      <div className="card h-100 p-3 rounded-4 border bg-light position-relative">
                        {addr.is_default === 1 && (
                          <span className="badge bg-primary position-absolute" style={{ top: '12px', right: '12px' }}>
                            Default
                          </span>
                        )}
                        <h6 className="fw-bold mb-1">{addr.full_name}</h6>
                        <small className="text-muted d-block mb-1">{addr.phone}</small>
                        <p className="small text-secondary mb-3 flex-grow-1">
                          {addr.street_address}<br />
                          {addr.city}, {addr.state} {addr.postal_code}<br />
                          {addr.country}
                        </p>

                        <div className="d-flex gap-2 mt-auto border-top pt-2">
                          {addr.is_default !== 1 && (
                            <button
                              className="btn btn-sm btn-link text-primary p-0 text-decoration-none small"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-link text-secondary p-0 text-decoration-none small ms-auto"
                            onClick={() => handleOpenEditAddress(addr)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-link text-danger p-0 text-decoration-none small ms-2"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Address Modal Modal Backdrop */}
              {showAddressModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 p-3">
                      <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">
                          {editingAddressId ? 'Edit Address' : 'Add New Address'}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowAddressModal(false)}
                        ></button>
                      </div>
                      <form onSubmit={handleSaveAddress}>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Full Name *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={addressForm.full_name}
                                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Phone *</label>
                              <input
                                type="tel"
                                className="form-control form-control-sm"
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label small fw-semibold">Street Address *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={addressForm.street_address}
                                onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">City *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">State *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">ZIP Code *</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-12">
                              <div className="form-check mt-1">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="modalDefaultCheck"
                                  checked={addressForm.is_default}
                                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                />
                                <label className="form-check-label small" htmlFor="modalDefaultCheck">
                                  Set as default shipping address
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={() => setShowAddressModal(false)}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-sm btn-shopera-primary rounded-pill px-3">
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Security Tab */}
          {activeTab === 'security' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-4">Update Password</h5>

              {passwordMsg.text && (
                <div className={`alert alert-${passwordMsg.type} rounded-3 py-2 small mb-3`}>
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password (at least 6 characters)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-shopera-primary rounded-pill px-4"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
