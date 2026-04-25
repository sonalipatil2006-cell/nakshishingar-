import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, X, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API_URL, { BASE_URL } from '../config';

const CATEGORY_TITLES = {
  nath: 'पारंपारिक नथ (Nath)',
  mangalsutra: 'मंगळसूत्र (Mangalsutra)',
  choker: 'चोकर (Choker)',
  jhumka: 'झुमका (Jhumka)',
  earcuff: 'इअर कफ्स (Ear Cuffs)',
  invisible: 'इनव्हिजिबल नेकलेस'
};

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?category=${id}`);
        const data = await res.json();
        setProducts(data);
      } catch {
        console.error('Error fetching products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />

      <main style={{ padding: '20px 5%' }}>
        <Link to="/dashboard" className="link" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>

        <h2 style={{ textAlign: 'center', color: 'var(--primary)', margin: '20px 0 40px', fontSize: '2.5rem' }}>
          {CATEGORY_TITLES[id] || id.charAt(0).toUpperCase() + id.slice(1)}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Loading designs...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
            <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '20px' }}>
              No designs found in this category yet. 🌸
            </p>
          </div>
        ) : (
          <div className="collections-grid">
            {products.map((p) => (
              <div className="collection-card" key={p._id} style={{ padding: '0', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(p)}
                  style={{
                    position: 'absolute', right: '15px', top: '15px', zIndex: 2,
                    background: 'white', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer',
                    color: isInWishlist(p._id) ? '#e91e63' : '#666',
                    transition: 'all 0.3s'
                  }}
                >
                  <Heart size={20} fill={isInWishlist(p._id) ? '#e91e63' : 'none'} />
                </button>

                {/* Product Image */}
                <img
                  src={`${BASE_URL}${p.imagePath}`}
                  alt={p.name}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />

                {/* Product Info */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: 'var(--text-dark)', fontWeight: '700' }}>{p.name}</h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.4rem', margin: 0 }}>₹{p.price}</p>
                    <span style={{
                      fontSize: '0.75rem',
                      background: p.inStock ? '#e8f5e9' : '#ffebee',
                      color: p.inStock ? '#2e7d32' : '#c62828',
                      padding: '4px 10px', borderRadius: '20px', fontWeight: '700'
                    }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={!p.inStock}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px', fontSize: '0.9rem', opacity: p.inStock ? 1 : 0.6, cursor: p.inStock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setViewProduct(p)}
                    className="btn btn-outline"
                    style={{ padding: '12px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={16} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== VIEW DETAILS MODAL ====== */}
        {viewProduct && (
          <ProductDetailModal
            product={viewProduct}
            onClose={() => setViewProduct(null)}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
            navigate={navigate}
          />
        )}

        {/* Review Modal */}
        {selectedProduct && (
          <ReviewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </main>
    </div>
  );
};

// ====== PRODUCT DETAIL MODAL (Left image, Right details + reviews) ======
const ProductDetailModal = ({ product, onClose, addToCart, toggleWishlist, isInWishlist, navigate }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/${product._id}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) { console.error(err); }
      finally { setReviewsLoading(false); }
    };
    fetchReviews();
  }, [product._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { alert('Please login to write a review'); return; }
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, rating, comment, userName: user?.fullName || 'Customer' })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setComment('');
        setRating(5);
      }
    } catch (err) { alert('Failed to submit review'); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '950px', maxHeight: '92vh', display: 'flex', overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()}>

        {/* LEFT: Product Image */}
        <div style={{ flex: '0 0 42%', position: 'relative' }}>
          <img src={`${BASE_URL}${product.imagePath}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Wishlist on image */}
          <button onClick={() => toggleWishlist(product)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 15px rgba(0,0,0,0.15)', cursor: 'pointer', color: isInWishlist(product._id) ? '#e91e63' : '#888' }}>
            <Heart size={22} fill={isInWishlist(product._id) ? '#e91e63' : 'none'} />
          </button>
        </div>

        {/* RIGHT: All Details */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '35px 30px', display: 'flex', flexDirection: 'column' }}>
          {/* Close button */}
          <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', color: '#666' }}>&times;</button>

          {/* Name */}
          <h2 style={{ margin: '0 0 5px', color: 'var(--text-dark)', fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.2 }}>{product.name}</h2>
          <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 15px', textTransform: 'capitalize' }}>{product.category} Collection</p>

          {/* Price */}
          <p style={{ color: 'var(--primary)', fontSize: '2.2rem', fontWeight: '800', margin: '0 0 20px' }}>₹{product.price}</p>

          {/* Description */}
          <div style={{ background: '#fdf8f9', padding: '20px', borderRadius: '16px', marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
            <p style={{ color: '#444', lineHeight: '1.8', margin: 0, fontSize: '0.95rem' }}>{product.description}</p>
          </div>

          {/* Info Tags */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <span style={{ background: product.inStock ? '#e8f5e9' : '#ffebee', color: product.inStock ? '#2e7d32' : '#c62828', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
            <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              🚚 Free Shipping
            </span>
            <span style={{ background: '#fff8e1', color: '#f9a825', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              ★ {product.avgRating || '5.0'} Rating
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
            <button
              onClick={() => { addToCart(product); onClose(); }}
              disabled={!product.inStock}
              className="btn btn-primary"
              style={{ flex: 1, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              style={{ padding: '14px 18px', borderRadius: '14px', border: '2px solid #e91e63', background: isInWishlist(product._id) ? '#fce4ec' : 'white', color: '#e91e63', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem' }}
            >
              <Heart size={18} fill={isInWishlist(product._id) ? '#e91e63' : 'none'} />
              {isInWishlist(product._id) ? 'Liked' : 'Like'}
            </button>
          </div>

          {/* Order Now Button */}
          <button
            onClick={() => { addToCart(product); onClose(); navigate('/checkout'); }}
            disabled={!product.inStock}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff6b35, #f7c948)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: '800', cursor: product.inStock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px', opacity: product.inStock ? 1 : 0.5, letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}
          >
            ⚡ Order Now
          </button>

          {/* ====== REVIEWS SECTION (Inline) ====== */}
          <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '15px' }}>
              Customer Reviews ({reviews.length})
            </h3>

            {/* Write Review */}
            {token ? (
              <form onSubmit={handleSubmitReview} style={{ background: '#fdf2f8', padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', fontSize: '1.3rem', color: star <= rating ? '#fbc02d' : '#ddd' }}>★</span>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '60px', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '10px', resize: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>Submit Review</button>
              </form>
            ) : (
              <p style={{ background: '#f5f5f5', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', color: '#888' }}>
                Login to write a review
              </p>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '15px' }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ color: '#bbb', textAlign: 'center', padding: '20px', fontSize: '0.9rem' }}>No reviews yet. Be the first! ✨</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map(r => (
                  <div key={r._id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#333' }}>{r.userName}</span>
                      <span style={{ color: '#fbc02d', fontSize: '0.85rem' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0', lineHeight: 1.5 }}>{r.comment}</p>
                    <span style={{ fontSize: '0.7rem', color: '#bbb' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ product, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/${product._id}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, [product._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { alert('Please login to write a review'); return; }
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          rating,
          comment,
          userName: user.fullName
        })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setComment('');
        alert('Review submitted! 🌸');
      }
    } catch (err) { alert('Failed to submit review'); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>

        <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>Reviews for {product.name}</h3>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '25px' }}>See what our customers are saying</p>

        {token ? (
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#fdf2f8', borderRadius: '16px' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '10px' }}>Write a Review</p>
            <div style={{ marginBottom: '10px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', fontSize: '1.4rem', color: star <= rating ? '#fbc02d' : '#ddd' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              required
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '80px', marginBottom: '10px', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Submit Review</button>
          </form>
        ) : (
          <p style={{ textAlign: 'center', background: '#f5f5f5', padding: '15px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.85rem' }}>
            Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login</Link> to share your feedback.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {loading ? <p>Loading reviews...</p> : reviews.length === 0 ? <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>No reviews yet. Be the first! ✨</p> : reviews.map(r => (
            <div key={r._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{r.userName}</span>
                <span style={{ color: '#fbc02d', display: 'flex', gap: '2px' }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{r.comment}</p>
              <span style={{ fontSize: '0.7rem', color: '#bbb' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
