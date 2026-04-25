import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Server error. Make sure backend is running.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0010 0%, #5c0020 50%, #8b0028 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '50px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #fce4ec', marginBottom: '15px' }} />
          <h2 style={{ color: '#8b0028', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Admin Panel</h2>
          <p style={{ color: '#999', marginTop: '5px' }}>Nakshishrungar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter admin email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginBottom: '10px' }}
          >
            🔐 Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
