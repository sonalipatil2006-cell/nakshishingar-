import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const [customOrders, setCustomOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('regular');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch Regular Orders
        const res = await fetch(`${API_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setOrders(data);

        // Fetch Custom Orders
        const customRes = await fetch(`${API_URL}/custom-orders/my-orders?email=${user.email}&phone=${user.mobile}`);
        const customData = await customRes.json();
        if (customRes.ok) setCustomOrders(customData);

      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, user.email, user.mobile]);

  const handleConfirmCustom = async (id) => {
    try {
      const res = await fetch(`${API_URL}/custom-orders/${id}/confirm`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setCustomOrders(customOrders.map(o => o._id === id ? { ...o, status: 'confirmed' } : o));
        alert('✨ Request confirmed! We will start making your piece now.');
      }
    } catch { alert('Failed to confirm'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: 'cancelled' } : o));
        alert('Order cancelled successfully');
      }
    } catch (err) { alert('Failed to cancel order'); }
  };

  const handleReturn = async (id) => {
    const reason = window.prompt('Please enter the reason for return:');
    if (!reason) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}/return`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: 'return-requested' } : o));
        alert('Return request submitted');
      }
    } catch (err) { alert('Failed to submit return request'); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': case 'pending': return <Clock size={16} />;
      case 'processing': case 'in-progress': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': case 'completed': return <CheckCircle size={16} />;
      case 'quoted': return <Package size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': case 'completed': return '#4caf50';
      case 'shipped': return '#2196f3';
      case 'processing': case 'in-progress': return '#ff9800';
      case 'quoted': return '#9c27b0';
      case 'cancelled': return '#f44336';
      default: return '#8b0028';
    }
  };

  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>
            Orders & Requests
          </h2>
          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '6px', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
            <button 
              onClick={() => setActiveTab('regular')}
              style={{ ...styles.tab(activeTab === 'regular') }}
            >
              Regular
            </button>
            <button 
              onClick={() => setActiveTab('custom')}
              style={{ ...styles.tab(activeTab === 'custom') }}
            >
              Custom
              {customOrders.some(o => o.status === 'quoted') && <span style={{ marginLeft: '6px', width: '8px', height: '8px', background: '#e91e63', borderRadius: '50%' }}></span>}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Loading...</p>
          </div>
        ) : !token ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
            <p style={{ color: '#666', fontSize: '1.2rem' }}>Please login to view your history. 🌸</p>
          </div>
        ) : activeTab === 'regular' ? (
          /* REGULAR ORDERS */
          orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
              <Package size={50} style={{ color: '#aaa', marginBottom: '20px' }} />
              <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>No orders yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => (
                <div key={order._id} style={{ 
                  background: 'white', borderRadius: '20px', padding: '25px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0',
                  borderLeft: `8px solid ${getStatusColor(order.orderStatus)}`
                }}>
                  {/* ... same regular order content ... */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Order #NS{order._id.slice(-6).toUpperCase()}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(order.orderStatus), fontWeight: '700' }}>
                      {getStatusIcon(order.orderStatus)} {order.orderStatus.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {order.items.map((it, i) => <span key={i} style={{ background: '#f5f5f5', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>{it.quantity}x {it.name}</span>)}
                  </div>
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem' }}>₹{order.totalAmount}</span>
                    {order.orderStatus === 'placed' && <button onClick={() => handleCancel(order._id)} style={styles.btn('#ffebee', '#c62828')}>Cancel</button>}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* CUSTOM ORDERS */
          customOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
              <Package size={50} style={{ color: '#aaa', marginBottom: '20px' }} />
              <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>No custom requests</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {customOrders.map((o) => (
                <div key={o._id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px' }}>
                    <img src={o.referenceImage ? `http://localhost:5050${o.referenceImage}` : '/placeholder.png'} style={{ width: '180px', height: '180px', objectFit: 'cover' }} alt='' />
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{o.category} Request</h4>
                          <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>ID: #REQ{o._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div style={{ padding: '6px 15px', borderRadius: '12px', background: getStatusColor(o.status) + '15', color: getStatusColor(o.status), fontWeight: '800', fontSize: '0.85rem' }}>
                          {o.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <p style={{ margin: '15px 0', color: '#444', fontSize: '0.95rem', lineHeight: 1.5 }}>"{o.description}"</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        {o.price > 0 ? (
                          <div style={{ background: '#fdf2f8', padding: '10px 20px', borderRadius: '12px', border: '1px solid #fce4ec' }}>
                            <span style={{ fontSize: '0.85rem', color: '#8b0028', fontWeight: '700' }}>Admin Quote: </span>
                            <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#8b0028' }}>₹{o.price}</span>
                          </div>
                        ) : (
                          <div style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>⏳ Waiting for Admin quote...</div>
                        )}
                        
                        {o.status === 'quoted' && (
                          <button onClick={() => handleConfirmCustom(o._id)} style={{ ...styles.btn('var(--primary)', 'white'), padding: '12px 30px' }}>
                            Proceed & Confirm
                          </button>
                        )}
                      </div>

                      {o.trackingInfo && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '12px', color: '#1565c0', fontSize: '0.9rem' }}>
                          <strong>🚚 Tracking:</strong> {o.trackingInfo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

const styles = {
  btn: (bg, color) => ({
    padding: '10px 20px',
    background: bg,
    color: color,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'all 0.3s'
  }),
  tab: (active) => ({
    padding: '10px 25px',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : '#666',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  })
};

export default Orders;
