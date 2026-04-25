import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import API_URL from '../config';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, mobile: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    console.log('[Register] Sending OTP request to server...', { email: formData.email, fullName: formData.fullName });
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, fullName: formData.fullName })
      });
      console.log('[Register] OTP response status:', res.status);
      const data = await res.json();
      if (res.ok) {
        console.log('[Register] OTP sent successfully');
        setOtpSent(true);
        setStep(2);
      } else {
        console.warn('[Register] Server returned error:', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('OTP Fetch Error:', err);
      setError('Connection error: ' + err.message + '. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Verify OTP
      const otpRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        setError(otpData.message || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Step 2: Register user
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('🎉 Registration Successful! Welcome to Nakshishrungar.');
        navigate('/dashboard');
      } else {
        setError(data.message);
        if (data.message.includes('exists')) setStep(1);
      }
    } catch (err) {
      console.error('Registration Fetch Error:', err);
      setError('Registration failed: ' + err.message + '. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 45px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', background: '#f9fafb', transition: 'all 0.3s' };
  const iconStyle = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#8b0028' };
  const eyeStyle = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888', cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f7 0%, #fce4ec 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(139,0,40,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '15px' }} />
          <h2 style={{ color: '#8b0028', margin: 0 }}>{step === 1 ? 'Get Started' : 'Verify Email'}</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>{step === 1 ? 'Create account in 2 simple steps' : `OTP has been sent to your email: ${formData.email}`}</p>
        </div>

        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '18px', position: 'relative' }}>
              <User size={18} style={iconStyle} />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={inputStyle} placeholder="Full Name" />
            </div>

            <div style={{ marginBottom: '18px', position: 'relative' }}>
              <Mail size={18} style={iconStyle} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="Email Address" />
            </div>

            <div style={{ marginBottom: '18px', position: 'relative' }}>
              <Phone size={18} style={iconStyle} />
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required style={inputStyle} placeholder="Mobile Number" maxLength="10" inputMode="numeric" pattern="[0-9]*" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} placeholder="Password" />
                <div onClick={() => setShowPassword(!showPassword)} style={eyeStyle}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} placeholder="Confirm" />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#8b0028', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Sending...' : <>Send OTP <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{ background: '#fff9fa', padding: '15px', borderRadius: '12px', border: '1px dashed #ec4899', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#8b0028', fontWeight: 'bold' }}>📧 OTP has been sent to your email</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{formData.email}</p>
            </div>

            <div style={{ marginBottom: '18px', position: 'relative' }}>
              <ShieldCheck size={18} style={iconStyle} />
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ ...inputStyle, padding: '15px', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '10px', fontWeight: '800' }}
                placeholder="000000"
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Verifying...' : <><CheckCircle size={18} /> Confirm & Register</>}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>← Edit Details</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#8b0028', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
