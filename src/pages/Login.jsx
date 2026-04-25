import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Try admin login first
    try {
      const adminRes = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const adminData = await adminRes.json();
      if (adminRes.ok) {
        localStorage.setItem('adminToken', adminData.token);
        setLoading(false);
        navigate('/admin/dashboard');
        return;
      }
    } catch {
      // Not an admin or server error - ignore and try customer login
    }

    // If not admin, try customer login
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoading(false);
        navigate('/dashboard');
        return;
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch {
      setError('Server error. Please check if backend is running.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce4ec 50%, #f8bbd0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '50px 45px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(139,0,40,0.1)', animation: 'slideUp 0.6s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#fce4ec', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px', boxShadow: '0 4px 15px rgba(252,228,236,0.8)' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', color: '#8b0028', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '28px', fontSize: '0.92rem' }}>Login to your account</p>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 18px', borderRadius: '12px', marginBottom: '18px', fontSize: '0.88rem', fontWeight: '600', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '6px', fontSize: '0.88rem' }}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '14px 18px', border: '2px solid #f1f1f1', borderRadius: '12px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#8b0028'}
              onBlur={(e) => e.target.style.borderColor = '#f1f1f1'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '6px', fontSize: '0.88rem' }}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '14px 18px', border: '2px solid #f1f1f1', borderRadius: '12px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#8b0028'}
              onBlur={(e) => e.target.style.borderColor = '#f1f1f1'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#8b0028', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.05rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', fontFamily: 'inherit' }}
          >
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', color: '#666', fontSize: '0.92rem' }}>
          New here? <Link to="/register" style={{ color: '#8b0028', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          <Link to="/" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
