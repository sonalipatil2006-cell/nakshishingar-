import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Camera, Send, CheckCircle, AlertCircle } from 'lucide-react';
import API_URL from '../config';

const Customize = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    customerName: user.fullName || '',
    phone: user.phone || '',
    email: user.email || '',
    description: '',
    category: 'nath',
    budget: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.description) {
      setStatus({ type: 'error', msg: 'Please fill in all required fields (Name, Phone, Description)' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (image) fd.append('referenceImage', image);

      const res = await fetch(`${API_URL}/custom-orders`, {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: '✨ Your custom order request has been sent! We will contact you soon.' });
        setFormData({ ...formData, description: '', budget: '' });
        setImage(null);
        setPreview(null);
      } else {
        const data = await res.json();
        setStatus({ type: 'error', msg: data.message || 'Failed to send request.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <div className="container" style={{ padding: '40px 5%', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '800px', width: '100%', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px' }}>
              ✨ Customise Your Jewellery
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Have a specific design in mind? Tell us and we'll make it for you!</p>
          </div>

          {status.msg && (
            <div style={{ 
              padding: '15px 20px', 
              borderRadius: '12px', 
              marginBottom: '25px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              background: status.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: status.type === 'success' ? '#2e7d32' : '#c62828',
              border: `1px solid ${status.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`
            }}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span style={{ fontWeight: '600' }}>{status.msg}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
              <div 
                onClick={() => document.getElementById('file-input').click()}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  border: '2px dashed #ddd', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: '#fcfcfc',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <>
                    <Camera size={40} color="#999" />
                    <p style={{ marginTop: '10px', color: '#666', fontWeight: '600' }}>Click to upload reference photo</p>
                    <p style={{ fontSize: '0.8rem', color: '#999' }}>PNG, JPG or JPEG</p>
                  </>
                )}
              </div>
              <input 
                id="file-input"
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#444' }}>Full Name *</label>
              <input 
                type="text" 
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#444' }}>Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile number"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#444' }}>Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', outline: 'none', background: 'white' }}
              >
                <option value="nath">Nath</option>
                <option value="mangalsutra">Mangalsutra</option>
                <option value="choker">Choker</option>
                <option value="earcuff">Ear Cuff</option>
                <option value="jhumka">Jhumka</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#444' }}>Approx. Budget (₹)</label>
              <input 
                type="text" 
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 500 - 1000"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', outline: 'none' }}
              />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#444' }}>Describe Your Design *</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4" 
                placeholder="Describe details like color, size, material, or any specific requirements..."
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', outline: 'none', resize: 'none' }}
              ></textarea>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary" 
              style={{ 
                gridColumn: 'span 2', 
                padding: '16px', 
                marginTop: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Sending Request...' : (
                <>
                  Send Request <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Customize;

