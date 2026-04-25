import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Save, Home, Landmark, Trash2, CheckCircle, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API_URL from '../config';

const Profile = () => {
  const navigate = useNavigate();
  const { clearAll } = useCart();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [formData, setFormData] = useState({
    dob: user.dob ? user.dob.split('T')[0] : '',
    address: {
      houseInfo: user.address?.houseInfo || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pincode: user.address?.pincode || '',
      landmark: user.address?.landmark || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.address) {
      setFormData({ ...formData, address: { ...formData.address, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMsg('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Pincode Validation (6-digit numeric)
    if (formData.address.pincode && !/^\d{6}$/.test(formData.address.pincode)) {
      setMsg('❌ Pincode must be exactly 6 digits');
      return;
    }
    
    // DOB Validation (10+)
    if (formData.dob) {
      const bday = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - bday.getFullYear();
      if (today.getMonth() < bday.getMonth() || (today.getMonth() === bday.getMonth() && today.getDate() < bday.getDate())) age--;
      
      if (age < 10) {
        setMsg('❌ Age must be at least 10 years');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('✅ Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      setMsg('❌ Connection error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', background: '#f9fafb' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: '#8b0028', fontWeight: '700', fontSize: '0.85rem', marginBottom: '8px' };

  return (
    <div style={{ background: '#fff9fa', minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '30px' }}>
        
        {/* Left Side: Summary */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(139,0,40,0.05)', height: 'fit-content', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fce4ec', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🌸</div>
          <h2 style={{ color: '#8b0028', margin: '0 0 5px' }}>{user.fullName}</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{user.email}</p>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '16px', fontSize: '0.85rem', color: '#555', textAlign: 'left' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📱 {user.mobile}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0 0' }}>📅 {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not Set'}</p>
          </div>

          <button
            onClick={() => {
              clearAll();
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
            style={{
              width: '100%',
              marginTop: '25px',
              padding: '14px',
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              transition: 'all 0.3s'
            }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>

        {/* Right Side: Form */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(139,0,40,0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8b0028', margin: '0 0 30px' }}>
            <User size={24} /> Complete Your Profile
          </h3>

          {msg && <div style={{ padding: '12px 20px', borderRadius: '14px', background: msg.includes('✅') ? '#e8f5e9' : '#ffebee', color: msg.includes('✅') ? '#2e7d32' : '#c62828', fontWeight: '600', marginBottom: '25px', fontSize: '0.9rem' }}>{msg}</div>}

          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}><Calendar size={16} /> Date of Birth (Age 10+ required)</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={inputStyle} />
            </div>

            <h4 style={{ color: '#8b0028', borderBottom: '1px solid #f1f1f1', paddingBottom: '10px', marginBottom: '20px', fontSize: '1rem' }}>📍 Shipping Address</h4>
            
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}><Home size={16} /> Flat / House / Lane</label>
              <textarea name="houseInfo" value={formData.address.houseInfo} onChange={handleChange} rows="2" style={{ ...inputStyle, resize: 'none' }} placeholder="Enter complete home address" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}><MapPin size={16} /> City</label>
                <input name="city" value={formData.address.city} onChange={handleChange} style={inputStyle} placeholder="e.g. Pune" />
              </div>
              <div>
                <label style={labelStyle}><MapPin size={16} /> State</label>
                <input name="state" value={formData.address.state} onChange={handleChange} style={inputStyle} placeholder="e.g. Maharashtra" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={labelStyle}><CheckCircle size={16} /> Pincode</label>
                <input name="pincode" value={formData.address.pincode} onChange={handleChange} maxLength="6" style={inputStyle} placeholder="000000" />
              </div>
              <div>
                <label style={labelStyle}><Landmark size={16} /> Landmark (Optional)</label>
                <input name="landmark" value={formData.address.landmark} onChange={handleChange} style={inputStyle} placeholder="e.g. Near Temple" />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#8b0028', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
              {loading ? 'Saving...' : <><Save size={20} /> Update Profile</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
