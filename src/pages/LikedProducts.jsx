import React from 'react';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const LikedProducts = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '30px', 
          display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800' 
        }}>
          <Heart fill="var(--primary)" size={32} />
          My Favorites
        </h2>
        
        {wishlist.length === 0 ? (
          <div style={{ 
            background: 'white', borderRadius: '24px', padding: '80px 20px', 
            textAlign: 'center', boxShadow: 'var(--shadow)', border: '1px solid #eee' 
          }}>
            <div style={{ 
              width: '100px', height: '100px', background: '#fff3f3', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 20px', color: '#ff5252' 
            }}>
              <Heart size={48} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Your wishlist is empty</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>Save your favorite designs to see them here later.</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={20} />
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="collections-grid">
            {wishlist.map((p) => (
              <div key={p._id} className="collection-card" style={{ padding: '20px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                 <button 
                   onClick={() => toggleWishlist(p)}
                   style={{ 
                     position: 'absolute', right: '15px', top: '15px', 
                     background: 'white', border: 'none', borderRadius: '50%', 
                     width: '36px', height: '36px', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', 
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
                     color: '#ff5252'
                   }}
                 >
                   <Trash2 size={18} />
                 </button>
                 
                 <img 
                   src={`http://localhost:5050${p.imagePath}`} 
                   alt={p.name} 
                   style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} 
                 />
                 
                 <div style={{ flex: 1 }}>
                    <h3 style={{ padding: '0', marginBottom: '5px', fontSize: '1.2rem', color: 'var(--text-dark)' }}>{p.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', margin: '10px 0' }}>₹{p.price}</p>
                 </div>
                 
                 <button 
                   onClick={() => addToCart(p)}
                   className="btn btn-primary" 
                   style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                 >
                   <ShoppingCart size={18} />
                   Move to Cart
                 </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LikedProducts;
