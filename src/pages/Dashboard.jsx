import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import API_URL, { BASE_URL } from '../config';

const DEFAULT_COLLECTIONS = [
  { id: 'nath', title: 'पारंपारिक नथ (Nath)', image: '/cat-nath.jpeg' },
  { id: 'mangalsutra', title: 'मंगळसूत्र (Mangalsutra)', image: '/cat-mangalsutra.jpeg' },
  { id: 'choker', title: 'चोकर (Choker)', image: '/cat-choker.jpeg' },
  { id: 'earcuff', title: 'इअर कफ्स (Ear Cuffs)', image: '/cat-earcuff.jpeg' },
  { id: 'jhumka', title: 'झुमका (Jhumka)', image: '/cat-jhumka.jpeg' },
  { id: 'invisible', title: 'इनव्हिजिबल नेकलेस', image: '/cat-invisible.jpeg' }
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [categories, setCategories] = useState([]);
  const isProfileIncomplete = !user.address || !user.address.city || !user.dob;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        setCategories(data.length > 0 ? data : DEFAULT_COLLECTIONS.map(c => ({ _id: c.id, name: c.id, label: c.title, imagePath: c.image })));
      } catch {
        setCategories(DEFAULT_COLLECTIONS.map(c => ({ _id: c.id, name: c.id, label: c.title, imagePath: c.image })));
      }
    };
    fetchCategories();
  }, []);

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%' }}>
        {/* Welcome Message */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '30px', marginBottom: '40px', boxShadow: 'var(--shadow)', borderLeft: '8px solid var(--primary)' }}>
          <h2 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.8rem' }}>Welcome Back, {user.fullName}! 🌸</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>What beautiful piece of jewellery are you looking for today?</p>
          
          {isProfileIncomplete && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fff9fa', borderRadius: '16px', border: '1px solid #fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: '#8b0028', fontWeight: '600' }}>📍 Your profile is incomplete. Please add address & birthday for faster checkout.</span>
              <Link to="/profile" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Complete Profile</Link>
            </div>
          )}
        </div>

        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '40px', fontSize: '2.2rem', fontWeight: '800' }}>
          Explore Collections
        </h2>
        
        <div className="collections-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          {categories.map((item) => (
            <Link to={`/category/${item.name}`} key={item._id} style={{ textDecoration: 'none' }}>
              <div className="collection-card" style={{ 
                background: 'white', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow)',
                height: '100%'
              }}>
                <img 
                  src={item.imagePath.startsWith('/') ? `${BASE_URL}${item.imagePath}` : item.imagePath} 
                  alt={item.label} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover' }} 
                  onError={(e) => { e.target.src = '/cat-nath.jpeg'; }}
                />
                <h3 style={{ 
                  padding: '25px', 
                  color: 'var(--primary)', 
                  fontSize: '1.4rem', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  {item.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
