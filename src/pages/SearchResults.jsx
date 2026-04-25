import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import API_URL, { BASE_URL } from '../config';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products`);
        const allProducts = await res.json();
        
        // Simple client-side filter for demonstration
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(q.toLowerCase()) || 
          p.description.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase())
        );
        
        setProducts(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (q) fetchResults();
  }, [q]);

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <Link to="/dashboard" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft size={20} />
            Back
          </Link>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>
            Search Results for "<span style={{ color: 'var(--primary)' }}>{q}</span>"
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="loader" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: '#666' }}>Searching through our collections...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
            <Search size={60} style={{ color: '#ddd', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#444', marginBottom: '10px' }}>No matches found</h3>
            <p style={{ color: '#888', marginBottom: '30px' }}>Try searching for "Nath", "Choker", or "Mangalsutra".</p>
            <Link to="/dashboard" className="btn btn-primary">Browse All Collections</Link>
          </div>
        ) : (
          <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {products.map((p) => (
              <div className="collection-card" key={p._id} style={{ padding: '20px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                 <button 
                   onClick={() => toggleWishlist(p)}
                   style={{ 
                     position: 'absolute', right: '15px', top: '15px', 
                     background: 'white', border: 'none', borderRadius: '50%', 
                     width: '36px', height: '36px', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', 
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
                     color: isInWishlist(p._id) ? '#e91e63' : '#666'
                   }} 
                 >
                   <Heart size={20} fill={isInWishlist(p._id) ? '#e91e63' : 'none'} />
                 </button>
                 
                 <img 
                   src={`${BASE_URL}${p.imagePath}`} 
                   alt={p.name} 
                   style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} 
                 />
                 
                 <div style={{ flex: 1 }}>
                    <h3 style={{ padding: '0', marginBottom: '5px', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '700' }}>{p.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.category}</p>
                    <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', margin: '10px 0' }}>₹{p.price}</p>
                 </div>
                 
                 <button 
                   onClick={() => addToCart(p)}
                   className="btn btn-primary" 
                   style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                 >
                   <ShoppingCart size={18} />
                   Add to Cart
                 </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
