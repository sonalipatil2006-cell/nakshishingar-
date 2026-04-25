import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../components/Header';

const OrderSuccess = () => {
  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{ 
          background: 'white', borderRadius: '32px', padding: '60px 40px', 
          maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow)',
          animation: 'slideUp 0.6s ease-out'
        }}>
          <div style={{ 
            width: '100px', height: '100px', background: '#e8f5e9', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 30px', color: '#4caf50' 
          }}>
            <CheckCircle size={56} />
          </div>

          <h1 style={{ color: 'var(--text-dark)', fontSize: '2.2rem', fontWeight: '800', marginBottom: '15px' }}>
            Congratulations! 🌸
          </h1>
          <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px' }}>
            Your order has been placed successfully.
          </p>
          <p style={{ color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
            Thank you for choosing Nakshishrungar. We are preparing your beautiful jewellery with love. 
            You will receive updates about your order status soon.
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 25px' }}>
              View My Orders
            </Link>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 25px' }}>
              Continue Shopping
              <ArrowRight size={20} />
            </Link>
          </div>

          <p style={{ marginTop: '40px', fontSize: '0.85rem', color: '#999' }}>
            Order ID: #NS{Math.floor(Math.random() * 90000) + 10000} • Confirmed
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
