import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Home = () => {
  return (
    <div className="container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Slides */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.15 }}>
        <img src="/slide1.jpeg" style={{ width: '50%', height: '100%', objectFit: 'cover' }} alt="bg1" />
        <img src="/slide2.jpeg" style={{ width: '50%', height: '100%', objectFit: 'cover' }} alt="bg2" />
      </div>

      <div className="card" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div className="logo-container">
          <div className="logo-circle">
            <img
              src="/logo.jpeg"
              alt="Nakshishrungar Logo"
              className="logo-img"
            />
          </div>
        </div>

        <h1 className="title">Nakshishrungar</h1>

        <div className="subtitle">
          <span>🌸</span>
          <span>नाजूक कला, शाश्वत शृंगार — प्रत्येक दागिन्यात प्रेम साकार</span>
          <span>🌸</span>
        </div>

        <div className="btn-group" style={{ marginBottom: '40px' }}>
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ShoppingBag size={20} />
            Browse Products
          </Link>
        </div>

        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '15px', fontWeight: '800' }}>✨ Top Collections</h3>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {[
              { name: 'Bridal Nath', price: '350', img: '/cat-nath.jpeg' },
              { name: 'Royal Choker', price: '650', img: '/cat-choker.jpeg' },
              { name: 'Beautiful Mangalsutra', price: '500', img: '/cat-mangalsutra.jpeg' }
            ].map((p, i) => (
              <div key={i} style={{ flexShrink: 0, width: '140px', background: '#fdf2f8', borderRadius: '16px', padding: '10px', border: '1px solid #fce4ec' }}>
                <img src={p.img} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} alt="" />
                <p style={{ fontSize: '0.8rem', fontWeight: '700', margin: 0, color: '#4a0404', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800' }}>₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discreet Admin Link */}
      <Link
        to="/admin"
        className="admin-secret-link"
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '25px',
          fontSize: '0.75rem',
          color: 'var(--primary)',
          textDecoration: 'none',
          opacity: 0.1,
          transition: 'opacity 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.5'}
        onMouseLeave={(e) => e.target.style.opacity = '0.1'}
      >
        Portal Access
      </Link>
    </div>
  );
};

export default Home;
