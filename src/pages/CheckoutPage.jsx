import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, CheckCircle, ArrowLeft, Copy, Smartphone } from 'lucide-react';
import API_URL, { BASE_URL } from '../config';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    houseInfo: '', city: '', state: '', pincode: '', landmark: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('checkout'); // 'checkout' | 'online-pay' | 'success'
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', fontWeight: '600', color: '#555', marginBottom: '8px', fontSize: '0.85rem' };

  useEffect(() => {
    if (!token) {
      alert('Please login to continue checkout');
      navigate('/login');
      return;
    }
    if (cart.length === 0 && step === 'checkout') {
      navigate('/dashboard');
      return;
    }
    if (user && user.address) {
      setFormData(prev => ({
        ...prev,
        ...user.address
      }));
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const placeOrder = async (paymentStatus = 'pending', txnId = null) => {
    const orderData = {
      items: cart.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: cartTotal,
      address: {
        houseInfo: formData.houseInfo,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark
      },
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      transactionId: txnId
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to place order');
    }
    return await res.json();
  };

  const handlePlaceOrder = async () => {
    setError('');

    // Validate required fields
    if (!formData.houseInfo || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all required address fields');
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      if (formData.paymentMethod === 'cod') {
        const order = await placeOrder('pending');
        setOrderId(order._id);
        clearCart();
        navigate('/order-success');
      } else {
        // AUTOMATED RAZORPAY PAYMENT
        await handleRazorpayPayment();
      }
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const response = await fetch(`${API_URL}/orders/create-payment-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: cartTotal })
      });
      
      const order = await response.json();
      if (!response.ok || !order.id) {
         throw new Error(order.message || 'Could not create payment order');
      }

      // 2. Open Razorpay Modal
      const options = {
        key: 'rzp_test_ShEvidAKyMrnB9',
        amount: order.amount,
        currency: "INR",
        name: "Nakshishrungar",
        description: "Jewellery Purchase",
        image: "/logo.jpeg",
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoading(true);
            
            // Prepare order data to be saved upon successful verification
            const orderData = {
              items: cart.map(item => ({
                product: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              })),
              totalAmount: cartTotal,
              address: {
                houseInfo: formData.houseInfo,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                landmark: formData.landmark
              },
              paymentMethod: 'online'
            };

            // 3. Verify Payment & Save Order (Done in one step on server)
            const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                ...response,
                orderData
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setOrderId(verifyData.order._id);
              clearCart();
              navigate('/order-success');
            } else {
              alert("❌ Payment verification failed: " + verifyData.message);
            }
          } catch (err) {
            alert("❌ Error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.mobile || ""
        },
        theme: {
          color: "#8b0028"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOnlinePaymentConfirm = async () => {
    // UPI transaction ID / UTR must be exactly 12 digits
    if (!/^\d{12}$/.test(transactionId.trim())) {
      setError('Please enter a valid 12-digit Transaction / UTR ID from your payment app');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await placeOrder('pending', transactionId.trim());
      setOrderId(order._id);
      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.message || 'Failed to confirm payment.');
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopyUPI = () => {
    navigator.clipboard.writeText('manalip742@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ====== CONDITIONAL RENDERING ======
  if (step === 'online-pay') {
    return (
      <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
        <Header />
        <main style={{ padding: '40px 5%', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#fdf2f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Smartphone size={40} color="var(--primary)" />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>Complete Payment</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>Please pay the total amount using any UPI app</p>
            
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '25px', marginBottom: '30px', border: '1px solid #edf2f7' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>Amount to Pay</p>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>₹{cartTotal}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontWeight: '700', marginBottom: '12px', fontSize: '0.95rem' }}>Scan QR Code or Pay to UPI ID</p>
              <div style={{ width: '200px', height: '200px', background: '#eee', margin: '0 auto 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                 {/* This would ideally be a dynamic QR code generator link */}
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=manalip742@okaxis%26pn=Nakshishrungar%26am=${cartTotal}%26cu=INR`} alt="Payment QR" style={{ width: '100%', borderRadius: '12px' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fff', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '10px', maxWidth: '300px', margin: '0 auto' }}>
                <code style={{ fontSize: '0.9rem', fontWeight: '700' }}>manalip742@okaxis</code>
                <button onClick={handleCopyUPI} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                  <Copy size={18} />
                </button>
              </div>
              {copied && <p style={{ fontSize: '0.75rem', color: '#4caf50', marginTop: '5px', fontWeight: '600' }}>UPI ID Copied!</p>}
            </div>

            <div style={{ textAlign: 'left', marginBottom: '30px' }}>
              <label style={labelStyle}>Enter 12-digit Transaction ID / UTR *</label>
              <input 
                type="text" 
                placeholder="Ex: 412345678901" 
                value={transactionId}
                onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                maxLength="12"
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: '800' }} 
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px' }}>You can find the UTR/Transaction ID in your Google Pay, PhonePe, or Paytm history.</p>
              {error && <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '10px', fontWeight: '600' }}>{error}</p>}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setStep('checkout')}
                style={{ flex: 1, padding: '16px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={handleOnlinePaymentConfirm}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2, padding: '16px', fontSize: '1.1rem' }}
              >
                {loading ? 'Verifying...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ====== MAIN CHECKOUT SCREEN ======
  return (
    <div style={{ background: 'var(--bg-soft)', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ padding: '40px 5%', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '30px', fontWeight: '600' }}>
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
          {/* Left: Form */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '30px' }}>Checkout Details</h2>
            
            {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={20} />
              Shipping Address
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Flat / House No / Building / Area *</label>
              <textarea name="houseInfo" value={formData.houseInfo} onChange={handleChange} required style={{ ...inputStyle, resize: 'none' }} rows="2" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input name="city" value={formData.city} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input name="state" value={formData.state} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input name="pincode" value={formData.pincode} onChange={handleChange} required maxLength="6" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Landmark</label>
                <input name="landmark" value={formData.landmark} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20} />
              Payment Method
            </h3>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div
                onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                style={{
                  flex: 1, padding: '20px', border: `2px solid ${formData.paymentMethod === 'cod' ? 'var(--primary)' : '#eee'}`,
                  borderRadius: '16px', cursor: 'pointer', background: formData.paymentMethod === 'cod' ? '#fdf2f8' : 'white',
                  transition: 'all 0.3s', textAlign: 'center'
                }}
              >
                <p style={{ fontWeight: '700', marginBottom: '4px', fontSize: '1rem' }}>💵 Cash on Delivery</p>
                <p style={{ fontSize: '0.75rem', color: '#888' }}>Pay when you receive</p>
              </div>
              <div
                onClick={() => setFormData({...formData, paymentMethod: 'online'})}
                style={{
                  flex: 1, padding: '20px', border: `2px solid ${formData.paymentMethod === 'online' ? 'var(--primary)' : '#eee'}`,
                  borderRadius: '16px', cursor: 'pointer', background: formData.paymentMethod === 'online' ? '#fdf2f8' : 'white',
                  transition: 'all 0.3s', textAlign: 'center'
                }}
              >
                <p style={{ fontWeight: '700', marginBottom: '4px', fontSize: '1rem' }}>📱 Online Payment</p>
                <p style={{ fontSize: '0.75rem', color: '#888' }}>UPI / Scanner / Card</p>
              </div>
            </div>

            {formData.paymentMethod === 'online' && (
              <div style={{ marginTop: '30px', padding: '25px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '15px' }}>Scan QR to Pay Instantly</p>
                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=manalip742@okaxis%26pn=Nakshishrungar%26am=${cartTotal}%26cu=INR`} 
                    alt="Payment QR" 
                    style={{ width: '150px', height: '150px', display: 'block' }} 
                  />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  You can scan this QR with GPay, PhonePe or Paytm. <br/>
                  <strong>OR</strong> click the button below to use Razorpay.
                </p>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Review Order</h3>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                    <img src={`${BASE_URL}${item.imagePath}`} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} alt='' />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px dashed #eee', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ color: '#666' }}>Shipping</span>
                  <span style={{ color: '#4caf50', fontWeight: '600' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '30px' }}>
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem' }}
                >
                  {loading ? 'Processing...' : formData.paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Pay'}
                  {!loading && <CheckCircle size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
