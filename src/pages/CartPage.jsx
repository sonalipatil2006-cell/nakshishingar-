import React from 'react';
import Header from '../components/Header';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '30px', fontWeight: '800' }}>
          Your Shopping Cart
        </h2>

        {cart.length === 0 ? (
          <div style={{ 
            background: 'white', borderRadius: '24px', padding: '80px 20px', 
            textAlign: 'center', boxShadow: 'var(--shadow)', border: '1px solid #eee' 
          }}>
            <div style={{ 
              width: '100px', height: '100px', background: '#fdf2f8', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' 
            }}>
              <ShoppingCart size={48} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Your cart is empty</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>Looks like you haven't added any beautiful designs yet.</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 30px' }}>
              <ShoppingBag size={20} />
              Browse Collections
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => (
                <div key={item._id} style={{ 
                  background: 'white', borderRadius: '20px', padding: '20px', 
                  display: 'flex', gap: '20px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)',
                  border: '1px solid #f0f0f0', position: 'relative'
                }}>
                  <img 
                    src={`http://localhost:5050${item.imagePath}`} 
                    alt={item.name} 
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '15px' }} 
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '700' }}>{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', padding: '5px' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>{item.category}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', borderRadius: '10px', padding: '5px' }}>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{ background: 'white', border: '1px solid #eee', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ margin: '0 15px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{ background: 'white', border: '1px solid #eee', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow)', border: '1px solid #f0f0f0', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', borderBottom: '2px solid #f9f9f9', paddingBottom: '15px' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{cartTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
                <span>Delivery Charges</span>
                <span style={{ color: '#4caf50', fontWeight: '600' }}>FREE</span>
              </div>
              
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', marginTop: '20px', 
                paddingTop: '20px', borderTop: '2px dashed #eee', marginBottom: '30px' 
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Total Amount</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>₹{cartTotal}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem' }}
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', color: '#aaa' }}>
                Secure Payment • 100% Original Designs
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
