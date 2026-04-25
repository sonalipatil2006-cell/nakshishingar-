import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import API_URL from '../config';

const API = API_URL;
// Fallback categories if none in DB
const DEFAULT_CATEGORIES = ['nath', 'mangalsutra', 'choker', 'earcuff', 'jhumka', 'invisible'];
const DEFAULT_CATEGORY_LABELS = { nath: 'Nath', mangalsutra: 'Mangalsutra', choker: 'Choker', earcuff: 'Ear Cuff', jhumka: 'Jhumka', invisible: 'Invisible Necklace' };
const ORDER_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'return-requested', 'returned', 'coming_soon'];
const CUSTOM_ORDER_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
const STATUS_COLORS = {
  placed: '#8b0028', processing: '#ff9800', shipped: '#2196f3', delivered: '#4caf50', cancelled: '#f44336',
  'return-requested': '#9c27b0', returned: '#673ab7',
  pending: '#ff9800', confirmed: '#2196f3', 'in-progress': '#9c27b0', completed: '#4caf50',
  new: '#2196f3', read: '#ff9800', replied: '#4caf50'
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'nath', image: null });
  const [editingProduct, setEditingProduct] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', label: '', image: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsRange, setStatsRange] = useState('monthly');
  const [statsLoading, setStatsLoading] = useState(false);
  const reportRef = useRef(null);



  const fetchProducts = useCallback(async () => {
    try {
      const url = filterCat === 'all' ? `${API}/products` : `${API}/products?category=${filterCat}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch { setProducts([]); }
  }, [filterCat]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feedback`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch { setFeedbacks([]); }
  }, [token]);

  const fetchCustomOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/custom-orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCustomOrders(Array.isArray(data) ? data : []);
    } catch { setCustomOrders([]); }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data.length > 0 ? data : DEFAULT_CATEGORIES.map(c => ({ name: c, label: DEFAULT_CATEGORY_LABELS[c] })));
    } catch { setCategories(DEFAULT_CATEGORIES.map(c => ({ name: c, label: DEFAULT_CATEGORY_LABELS[c] }))); }
  }, []);

  const fetchOrders = useCallback(async () => {
    console.log(`[Admin] Fetching orders from: ${API}/orders`);
    try {
      const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`[Admin] Orders response status: ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error('[Admin] Fetch Orders Error:', err);
      setOrders([]); 
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API}/admin/stats?range=${statsRange}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token, statsRange]);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    const loadData = async () => {
      await fetchCategories();
      await fetchProducts();
      await fetchFeedbacks();
      await fetchCustomOrders();
      await fetchOrders();
      await fetchStats();
    };
    loadData();
  }, [token, navigate, fetchProducts, fetchFeedbacks, fetchCustomOrders, fetchOrders, fetchCategories, fetchStats]);

  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, form.category]);

  const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/admin'); };

  /* ---- Product Handlers ---- */
  const handleFormChange = (e) => {
    if (e.target.name === 'image') setForm({ ...form, image: e.target.files[0] });
    else setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('description', form.description);
      fd.append('price', form.price); fd.append('category', form.category);
      if (form.image) fd.append('image', form.image);
      
      const url = editingProduct ? `${API}/products/${editingProduct._id}` : `${API}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) { 
        setMsg(editingProduct ? '✅ Product updated!' : '✅ Product added!'); 
        setForm({ name: '', description: '', price: '', category: categories[0]?.name || 'nath', image: null }); 
        setEditingProduct(null);
        if (!editingProduct) e.target.reset(); 
        fetchProducts(); 
        if (editingProduct) setActiveTab('products');
      }
      else { setMsg(`❌ ${data.message}`); }
    } catch { setMsg('❌ Server error.'); }
    setLoading(false);
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: null });
    setActiveTab('add');
    setMsg('');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', catForm.name);
      fd.append('label', catForm.label);
      if (catForm.image) fd.append('image', catForm.image);

      const url = editingCategory ? `${API}/categories/${editingCategory._id}` : `${API}/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        setCatForm({ name: '', label: '', image: null });
        setEditingCategory(null);
        if (!editingCategory) e.target.reset();
        fetchCategories();
        setMsg(editingCategory ? '✅ Category updated!' : '✅ Category added!');
      }
    } catch { setMsg('❌ Error saving category'); }
  };

  const handleCategoryEditClick = (c) => {
    setEditingCategory(c);
    setCatForm({ name: c.name, label: c.label, image: null });
    setMsg('');
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? Products in this category might not show up correctly.')) return;
    await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  };

  const handleToggleStock = async (id) => {
    await fetch(`${API}/products/${id}/stock`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  };

  /* ---- Feedback Handlers ---- */
  const handleFeedbackStatus = async (id, status) => {
    await fetch(`${API}/feedback/${id}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchFeedbacks();
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Delete feedback?')) return;
    await fetch(`${API}/feedback/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchFeedbacks();
  };

  /* ---- Custom Order Handlers ---- */
  const handleCustomOrderStatus = async (id, status, extraData = {}) => {
    try {
      const res = await fetch(`${API}/custom-orders/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extraData })
      });
      if (res.ok) {
        fetchCustomOrders();
        setMsg('✅ Custom order updated');
      }
    } catch {
      setMsg('❌ Failed to update');
    }
  };

  const handleDeleteCustomOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await fetch(`${API}/custom-orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCustomOrders();
  };

  /* ---- Regular Order Handlers ---- */
  const handleUpdateOrderStatus = async (id, orderStatus, paymentStatus) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus, paymentStatus })
    });
    fetchOrders();
  };

  const handleExportCSV = (dataToExport = orders, filename = 'Orders_Report') => {
    const isStats = filename.includes('Analytics');
    let header, rows;

    if (isStats && stats) {
      header = ['Date', 'Sales Amount'].join(',');
      rows = stats.salesData.map(d => [d.date, d.amount].join(','));
    } else {
      header = ['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Payment'].join(',');
      rows = dataToExport.map(o => [
        `NS${o._id.slice(-6).toUpperCase()}`,
        new Date(o.createdAt).toLocaleDateString(),
        o.customer?.fullName,
        o.items.map(i => `${i.name}(${i.quantity})`).join(';'),
        o.totalAmount,
        o.orderStatus,
        o.paymentStatus
      ].join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.setTextColor(139, 0, 40); // gold/accent
      pdf.text(`Nakshishrungar - Business Report (${statsRange})`, 15, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 22);
      
      pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`Nakshi_Report_${statsRange}_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
    setLoading(false);
  };

  /* ---- Stats for Dashboard ---- */
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.filter(p => !p.inStock).length;
  const newFeedback = feedbacks.filter(f => f.status === 'new').length;
  const pendingCustomOrders = customOrders.filter(o => o.status === 'pending').length;
  const pendingRegularOrders = orders.filter(o => o.orderStatus === 'placed' || o.orderStatus === 'return-requested').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'completed' ? o.totalAmount : 0), 0);

  // Calculate Top Products
  const productSales = {};
  orders.forEach(o => {
    if (o.paymentStatus === 'completed') {
      o.items.forEach(i => {
        productSales[i.name] = (productSales[i.name] || 0) + i.quantity;
      });
    }
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* =================== STYLES =================== */
  const colors = { primary: '#1a1a2e', secondary: '#16213e', accent: '#8b0028', accentLight: '#fce4ec', gold: '#d4a373', white: '#ffffff', gray: '#94a3b8', lightBg: '#f1f5f9', cardBg: '#ffffff', text: '#1e293b', textLight: '#64748b' };
  const styles = {
    container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: colors.lightBg },
    sidebar: { width: sidebarOpen ? '260px' : '70px', background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`, minHeight: '100vh', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100, boxShadow: '4px 0 20px rgba(0,0,0,0.15)' },
    sidebarHeader: { padding: sidebarOpen ? '25px 20px' : '25px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    logo: { width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' },
    nav: { flex: 1, paddingTop: '10px' },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '14px', padding: sidebarOpen ? '13px 22px' : '13px 20px', cursor: 'pointer', color: active ? colors.white : 'rgba(255,255,255,0.5)', background: active ? 'rgba(139,0,40,0.4)' : 'transparent', borderLeft: active ? `3px solid ${colors.gold}` : '3px solid transparent', fontWeight: active ? '600' : '400', fontSize: '0.92rem', transition: 'all 0.2s', letterSpacing: '0.02em' }),
    navIcon: { fontSize: '1.2rem', width: '24px', textAlign: 'center' },
    main: { flex: 1, marginLeft: sidebarOpen ? '260px' : '70px', padding: '28px 35px', transition: 'margin-left 0.3s ease', minHeight: '100vh' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '20px', borderBottom: `1px solid #e2e8f0` },
    pageTitle: { fontSize: '1.75rem', fontWeight: '800', color: colors.text, margin: 0, letterSpacing: '-0.02em' },
    badge: (color) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: color || colors.accent, color: colors.white, borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: '700', minWidth: '24px' }),
    card: { background: colors.cardBg, borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px', border: '1px solid #e8ecf1' },
    statCard: (accent) => ({ background: colors.cardBg, borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1', borderLeft: `4px solid ${accent}`, display: 'flex', alignItems: 'center', gap: '18px' }),
    statIcon: (bg) => ({ width: '52px', height: '52px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }),
    statValue: { fontSize: '2rem', fontWeight: '800', color: colors.text, lineHeight: 1 },
    statLabel: { fontSize: '0.85rem', color: colors.textLight, marginTop: '4px' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
    th: { padding: '12px 16px', textAlign: 'left', color: colors.textLight, fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
    td: { padding: '14px 16px', background: colors.cardBg, fontSize: '0.9rem', color: colors.text },
    btn: (bg, color) => ({ padding: '7px 16px', background: bg || colors.accent, color: color || colors.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' }),
    filterBtn: (active) => ({ 
      padding: '12px 24px', 
      borderRadius: '14px', 
      border: active ? `3px solid ${colors.gold}` : '1px solid #e2e8f0', 
      background: active ? colors.accent : colors.white, 
      color: active ? colors.white : colors.text, 
      cursor: 'pointer', 
      fontWeight: '700', 
      fontSize: '1rem', 
      boxShadow: active ? '0 10px 20px rgba(139,0,40,0.2)' : '0 2px 5px rgba(0,0,0,0.05)', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '110px',
      textAlign: 'center',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      letterSpacing: '0.02em',
      transform: active ? 'translateY(-2px)' : 'none'
    }),
    input: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' },
    label: { fontWeight: '600', color: colors.text, display: 'block', marginBottom: '6px', fontSize: '0.88rem' },
    statusPill: (status) => ({ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', color: colors.white, background: STATUS_COLORS[status] || '#999', textTransform: 'capitalize' }),
    empty: { textAlign: 'center', padding: '60px 0', color: colors.textLight, fontSize: '1.1rem' }
  };

  /* =================== TABS =================== */
  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'orders', icon: '🛒', label: 'All Orders' },
    { id: 'products', icon: '📦', label: 'Products' },
    { id: 'add', icon: '➕', label: 'Add Product' },
    { id: 'feedback', icon: '💬', label: 'Feedback' },
    { id: 'custom-orders', icon: '🎨', label: 'Custom Orders' },
  ];

  const tabTitles = {
    dashboard: '📊 Dashboard Overview',
    reports: '📈 Sales & Analytics',
    orders: '🛒 Customer Orders',
    products: '📦 Product Management',
    add: '➕ Add/Edit Product',
    feedback: '💬 Customer Feedback',
    'custom-orders': '🎨 Custom Order Requests',
    'manage-categories': '🏷️ Manage Categories'
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.container}>
      {/* ========== SIDEBAR ========== */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <img src="/logo.jpeg" alt="logo" style={styles.logo} />
          {sidebarOpen && (
            <div>
              <div style={{ color: colors.white, fontWeight: '700', fontSize: '1rem' }}>Nakshishrungar</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginTop: '2px' }}>Admin Panel</div>
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {tabs.map(t => (
            <div key={t.id} style={styles.navItem(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
              <span style={styles.navIcon}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.id === 'orders' && pendingRegularOrders > 0 && <span style={styles.badge('#8b0028')}>{pendingRegularOrders}</span>}
              {sidebarOpen && t.id === 'feedback' && newFeedback > 0 && <span style={styles.badge('#e91e63')}>{newFeedback}</span>}
              {sidebarOpen && t.id === 'custom-orders' && pendingCustomOrders > 0 && <span style={styles.badge('#ff9800')}>{pendingCustomOrders}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} style={{ ...styles.btn('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.7)'), width: '100%', justifyContent: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.15)' }}>
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </div>

      <div style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>{tabTitles[activeTab]}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {activeTab === 'orders' && (
              <button onClick={() => handleExportCSV()} style={styles.btn('#1565c0', 'white')}>📥 Export Orders</button>
            )}
            {activeTab === 'reports' && stats && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleExportCSV(null, `Analytics_${statsRange}`)} style={styles.btn('#1565c0', 'white')}>📥 Download CSV</button>
                <button onClick={handleDownloadPDF} style={styles.btn('#d32f2f', 'white')}>📄 Download PDF (Full Report)</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.88rem', color: colors.text }}>Admin</div>
                <div style={{ fontSize: '0.75rem', color: colors.textLight }}>nakshishrungar</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== PAGE: DASHBOARD ========== */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              <div style={styles.statCard('#4caf50')}>
                <div style={styles.statIcon('#e8f5e9')}>💰</div>
                <div><div style={{ ...styles.statValue, fontSize: '1.6rem' }}>₹{totalSales}</div><div style={styles.statLabel}>Total Sales</div></div>
              </div>
              <div style={styles.statCard(colors.accent)}>
                <div style={styles.statIcon(colors.accentLight)}>🛒</div>
                <div><div style={styles.statValue}>{orders.length}</div><div style={styles.statLabel}>Regular Orders</div></div>
              </div>
              <div style={styles.statCard('#2196f3')}>
                <div style={styles.statIcon('#e3f2fd')}>📦</div>
                <div><div style={styles.statValue}>{totalProducts}</div><div style={styles.statLabel}>Products</div></div>
              </div>
              <div style={styles.statCard('#ff9800')}>
                <div style={styles.statIcon('#fff3e0')}>🎨</div>
                <div><div style={styles.statValue}>{pendingCustomOrders}</div><div style={styles.statLabel}>Custom Reqs</div></div>
              </div>
              <div style={styles.statCard('#e91e63')}>
                <div style={styles.statIcon('#fce4ec')}>💬</div>
                <div><div style={styles.statValue}>{newFeedback}</div><div style={styles.statLabel}>Feedback</div></div>
              </div>
              <div style={styles.statCard('#4caf50')}>
                <div style={styles.statIcon('#e8f5e9')}>✅</div>
                <div><div style={styles.statValue}>{inStockCount}</div><div style={styles.statLabel}>In Stock</div></div>
              </div>
              <div style={styles.statCard('#f44336')}>
                <div style={styles.statIcon('#ffebee')}>❌</div>
                <div><div style={styles.statValue}>{outOfStockCount}</div><div style={styles.statLabel}>Out of Stock</div></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 18px', color: colors.text, fontSize: '1.1rem' }}>🛒 Latest Orders</h3>
                {orders.slice(0, 5).map(o => (
                  <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{o.customer?.fullName || 'User'}</div>
                      <div style={{ fontSize: '0.75rem', color: colors.textLight }}>{formatDate(o.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: colors.accent, fontSize: '0.9rem' }}>₹{o.totalAmount}</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: STATUS_COLORS[o.orderStatus] }}>{o.orderStatus.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setActiveTab('orders')} style={{ ...styles.btn(colors.accentLight, colors.accent), width: '100%', marginTop: '15px' }}>View All Orders</button>
              </div>
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 18px', color: colors.text, fontSize: '1.1rem' }}>🎨 Latest Custom Requests</h3>
                {customOrders.slice(0, 5).map(o => (
                  <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: colors.textLight }}>{o.category}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: STATUS_COLORS[o.status] }}>{o.status.toUpperCase()}</span>
                  </div>
                ))}
                <button onClick={() => setActiveTab('custom-orders')} style={{ ...styles.btn(colors.accentLight, colors.accent), width: '100%', marginTop: '15px' }}>View All Requests</button>
              </div>
            </div>

            {/* Top Products Section (Compact) */}
            <div style={{ ...styles.card, marginTop: '20px' }}>
              <h3 style={{ margin: '0 0 18px', color: colors.text, fontSize: '1.1rem' }}>🔥 Best Selling This Month</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {topProducts.slice(0, 4).map(([name, qty]) => (
                  <div key={name} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', textAlign: 'center', border: '1px solid #edf2f7' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: colors.accent }}>{qty}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.text, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== PAGE: REPORTS & ANALYTICS ========== */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              {['weekly', 'monthly', 'yearly', 'all'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setStatsRange(r)} 
                  style={{...styles.filterBtn(statsRange === r), padding: '8px 20px', minWidth: 'auto', fontSize: '0.9rem'}}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {statsLoading ? (
              <div style={styles.empty}>📊 Loading analytics...</div>
            ) : !stats ? (
              <div style={styles.empty}>No data available for this range.</div>
            ) : (
              <div ref={reportRef} style={{ display: 'grid', gap: '20px', padding: activeTab === 'reports' ? '0' : '20px', background: 'transparent' }}>
                {/* Summary Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={styles.statCard('#4caf50')}>
                    <div style={styles.statIcon('#e8f5e9')}>📈</div>
                    <div><div style={styles.statValue}>₹{stats.totalRevenue}</div><div style={styles.statLabel}>Total Revenue</div></div>
                  </div>
                  <div style={styles.statCard('#f44336')}>
                    <div style={styles.statIcon('#ffebee')}>📉</div>
                    <div><div style={styles.statValue}>₹{stats.totalLoss}</div><div style={styles.statLabel}>Loss / Refunds</div></div>
                  </div>
                  <div style={styles.statCard(colors.gold)}>
                    <div style={styles.statIcon('#fdf2f2')}>💎</div>
                    <div><div style={styles.statValue}>₹{stats.netProfit}</div><div style={styles.statLabel}>Net Profit (Est.)</div></div>
                  </div>
                  <div style={styles.statCard('#2196f3')}>
                    <div style={styles.statIcon('#e3f2fd')}>📦</div>
                    <div><div style={styles.statValue}>{stats.completedOrders}</div><div style={styles.statLabel}>Completed Orders</div></div>
                  </div>
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                  <div style={styles.card}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', color: colors.text }}>Sales Trend ({statsRange})</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.salesData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={10} 
                            tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          />
                          <YAxis fontSize={10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          />
                          <Line type="monotone" dataKey="amount" stroke={colors.accent} strokeWidth={3} dot={{ r: 4, fill: colors.accent }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={styles.card}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', color: colors.text }}>Product Sales</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.productPerformance.slice(0, 5)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" fontSize={10} hide />
                          <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                          <Tooltip />
                          <Bar dataKey="qty" fill={colors.gold} radius={[0, 4, 4, 0]}>
                            {stats.productPerformance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? colors.accent : colors.gold} opacity={1 - (index * 0.15)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={{ margin: '0 0 15px', fontSize: '1rem', color: colors.text }}>Overall Status Distribution</h3>
                  <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ height: '200px', width: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'Completed', value: stats.completedOrders },
                              { name: 'Cancelled', value: stats.cancelledOrders },
                              { name: 'Refunded', value: stats.refundedOrders },
                              { name: 'Pending', value: stats.pendingOrders }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#4caf50" />
                            <Cell fill="#f44336" />
                            <Cell fill="#9c27b0" />
                            <Cell fill="#ff9800" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                       <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#2e7d32', fontWeight: '700' }}>SUCCESS</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1b5e20' }}>{Math.round((stats.completedOrders / stats.totalOrders) * 100) || 0}%</span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#4caf50' }}>{stats.completedOrders} orders</span>
                       </div>
                       <div style={{ padding: '12px', background: '#ffebee', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#c62828', fontWeight: '700' }}>CANCEL</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#b71c1c' }}>{Math.round((stats.cancelledOrders / stats.totalOrders) * 100) || 0}%</span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#f44336' }}>{stats.cancelledOrders} orders</span>
                       </div>
                       <div style={{ padding: '12px', background: '#f3e5f5', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#7b1fa2', fontWeight: '700' }}>REFUND</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#4a148c' }}>{Math.round((stats.refundedOrders / stats.totalOrders) * 100) || 0}%</span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#9c27b0' }}>{stats.refundedOrders} orders</span>
                       </div>
                       <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '10px' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#e65100', fontWeight: '700' }}>PENDING</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#bf360c' }}>{Math.round((stats.pendingOrders / stats.totalOrders) * 100) || 0}%</span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#ff9800' }}>{stats.pendingOrders} orders</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== PAGE: ORDERS (REGULAR) ========== */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={styles.empty}>No cart orders placed yet 🛒</div>
            ) : (
              <div style={{ display: 'grid', gap: '18px' }}>
                {orders.map(o => (
                  <div key={o._id} style={{ ...styles.card, marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Order #NS{o._id.slice(-6).toUpperCase()}</h3>
                          <span style={styles.statusPill(o.orderStatus)}>{o.orderStatus}</span>
                        </div>
                        <p style={{ margin: '5px 0', color: colors.textLight, fontSize: '0.85rem' }}>
                          Customer: <strong>{o.customer?.fullName}</strong> ({o.customer?.email}) | {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.accent }}>₹{o.totalAmount}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textLight }}>Payment: <strong style={{ color: o.paymentStatus === 'completed' ? '#4caf50' : '#ff9800' }}>{o.paymentStatus.toUpperCase()} ({o.paymentMethod})</strong></div>
                        {o.paymentMethod === 'online' && o.transactionId && (
                          <div style={{ fontSize: '0.85rem', color: '#d32f2f', marginTop: '6px', fontWeight: 'bold', background: '#ffebee', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            Verify UTR: {o.transactionId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', color: colors.textLight }}>Items</p>
                        {o.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <span>{item.quantity} x {item.name}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', color: colors.textLight }}>Shipping Address</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {o.address.houseInfo}, {o.address.city}, {o.address.state} - {o.address.pincode}
                          {o.address.landmark && <><br />Landmark: {o.address.landmark}</>}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Update Status:</span>
                      {ORDER_STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdateOrderStatus(o._id, s, s === 'delivered' ? 'completed' : (s === 'returned' ? 'refunded' : o.paymentStatus))}
                          style={{ ...styles.btn(o.orderStatus === s ? colors.accent : '#eee', o.orderStatus === s ? 'white' : '#666'), fontSize: '0.75rem' }}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                      <div style={{ margin: '0 10px', height: '24px', width: '1px', background: '#ddd' }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Actions:</span>
                      <button onClick={() => handleUpdateOrderStatus(o._id, o.orderStatus, 'completed')} style={styles.btn(o.paymentStatus === 'completed' ? '#4caf50' : '#eee', o.paymentStatus === 'completed' ? 'white' : '#666')}>Set PAID</button>
                      {o.orderStatus === 'return-requested' && (
                        <div style={{ padding: '8px 15px', background: '#f3e5f5', borderRadius: '8px', border: '1px solid #9c27b0', fontSize: '0.8rem', color: '#7b1fa2' }}>
                          <strong>Reason:</strong> {o.returnReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== PAGE: PRODUCTS ========== */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => setFilterCat('all')} style={styles.filterBtn(filterCat === 'all')}>All Products ({products.length})</button>
              {categories.map(c => {
                const count = products.filter(p => p.category === c.name).length;
                return (
                  <button key={c.name} onClick={() => setFilterCat(c.name)} style={styles.filterBtn(filterCat === c.name)}>
                    {c.label || c.name} ({count})
                  </button>
                );
              })}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: categories[0]?.name || 'nath', image: null }); setActiveTab('add'); }} style={{ ...styles.btn(colors.accent), padding: '10px 15px' }}>➕ Add Product</button>
                <button onClick={() => setActiveTab('manage-categories')} style={{ ...styles.btn('#333'), padding: '10px 15px' }}>🏷️ Manage Categories</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
              {products.map(p => (
                <div key={p._id} style={{ ...styles.card, padding: 0, overflow: 'hidden', marginBottom: 0 }}>
                  <img src={`http://localhost:5050${p.imagePath}`} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ color: colors.accent, fontWeight: '800' }}>₹{p.price}</span>
                      <span style={styles.statusPill(p.inStock ? 'completed' : 'cancelled')}>{p.inStock ? 'In Stock' : 'Out'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditClick(p)} style={styles.btn('#e3f2fd', '#1565c0')}>Edit</button>
                      <button onClick={() => handleToggleStock(p._id)} style={styles.btn('#fff3e0', '#e65100')}>Stock</button>
                      <button onClick={() => handleDelete(p._id)} style={styles.btn('#ffebee', '#c62828')}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== PAGE: ADD PRODUCT ========== */}
        {activeTab === 'add' && (
          <div style={{ maxWidth: '600px' }}>
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                {editingProduct && <button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: categories[0]?.name || 'nath', image: null }); }} style={styles.btn('#f3f4f6', '#4b5563')}>Cancel Edit</button>}
              </div>
              {msg && <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '15px' }}>{msg}</div>}
              <form onSubmit={handleAddProduct}>
                <div style={{ marginBottom: '15px' }}><label style={styles.label}>Name</label><input name="name" style={styles.input} value={form.name} onChange={handleFormChange} required /></div>
                <div style={{ marginBottom: '15px' }}><label style={styles.label}>Desc</label><textarea name="description" style={styles.input} rows="2" value={form.description} onChange={handleFormChange} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div><label style={styles.label}>Price</label><input name="price" type="number" style={styles.input} value={form.price} onChange={handleFormChange} required /></div>
                  <div><label style={styles.label}>Cat</label><select name="category" style={styles.input} value={form.category} onChange={handleFormChange}>
                    {categories.map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
                  </select></div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Photo {editingProduct && '(Leave blank to keep current)'}</label>
                  <input name="image" type="file" style={styles.input} onChange={handleFormChange} required={!editingProduct} />
                </div>
                <button type="submit" disabled={loading} style={{ ...styles.btn(colors.accent), width: '100%', padding: '12px' }}>
                  {loading ? '⏳ Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========== PAGE: FEEDBACK ========== */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'grid', gap: '14px' }}>
            {feedbacks.map(f => (
              <div key={f._id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0 }}>{f.customerName} (⭐{f.rating})</h4>
                  <span style={styles.statusPill(f.status)}>{f.status}</span>
                </div>
                <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', margin: '10px 0' }}>{f.message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleFeedbackStatus(f._id, 'read')} style={styles.btn('#e3f2fd', '#1565c0')}>Read</button>
                  <button onClick={() => handleFeedbackStatus(f._id, 'replied')} style={styles.btn('#e8f5e9', '#2e7d32')}>Replied</button>
                  <button onClick={() => handleDeleteFeedback(f._id)} style={styles.btn('#ffebee', '#c62828')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== PAGE: CUSTOM ORDERS ========== */}
        {activeTab === 'custom-orders' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {customOrders.length === 0 ? (
              <div style={styles.empty}>No custom order requests yet.</div>
            ) : (
              customOrders.map(o => (
                <div key={o._id} style={{ ...styles.card, display: 'grid', gridTemplateColumns: '150px 1fr 250px', gap: '25px', alignItems: 'start' }}>
                  {/* Photo */}
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={o.referenceImage ? `http://localhost:5050${o.referenceImage}` : '/placeholder.png'} 
                      alt="Ref" 
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #eee' }} 
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <span style={styles.statusPill(o.status)}>{o.status}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem' }}>{o.customerName}</h3>
                    <p style={{ color: colors.textLight, fontSize: '0.85rem', marginBottom: '10px' }}>
                      📱 {o.phone} | ✉️ {o.email || 'No email'} | 🏷️ {o.category}
                    </p>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #edf2f7' }}>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>"{o.description}"</p>
                      {o.budget && <p style={{ margin: '8px 0 0', fontWeight: '700', color: colors.accent, fontSize: '0.85rem' }}>Budget: {o.budget}</p>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {['pending', 'in-progress', 'completed', 'cancelled'].map(s => (
                        <button key={s} onClick={() => handleCustomOrderStatus(o._id, s)} style={{ ...styles.btn(o.status === s ? colors.accent : '#eee', o.status === s ? 'white' : '#666'), fontSize: '0.75rem' }}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>

                  {/* Actions (Price & Tracking) */}
                  <div style={{ borderLeft: '1px solid #eee', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={styles.label}>Set Price (₹)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="number" 
                          defaultValue={o.price} 
                          placeholder="Quote price"
                          style={{ ...styles.input, padding: '8px 12px' }} 
                          id={`price-${o._id}`}
                        />
                        <button 
                          onClick={() => handleCustomOrderStatus(o._id, 'quoted', { price: document.getElementById(`price-${o._id}`).value })}
                          style={styles.btn(colors.gold, 'white')}
                        >
                          Quote
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>Tracking Info</label>
                      <textarea 
                        defaultValue={o.trackingInfo} 
                        placeholder="Courier name, ID..."
                        style={{ ...styles.input, padding: '8px 12px', fontSize: '0.8rem' }} 
                        rows="2"
                        id={`tracking-${o._id}`}
                      />
                      <button 
                        onClick={() => handleCustomOrderStatus(o._id, 'shipped', { trackingInfo: document.getElementById(`tracking-${o._id}`).value })}
                        style={{ ...styles.btn('#2196f3', 'white'), width: '100%', marginTop: '8px' }}
                      >
                        🚚 Mark Shipped
                      </button>
                    </div>

                    <button onClick={() => handleDeleteCustomOrder(o._id)} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: 'auto' }}>Delete Request</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== PAGE: MANAGE CATEGORIES ========== */}
        {activeTab === 'manage-categories' && (
          <div style={{ maxWidth: '800px' }}>
            {msg && <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '15px' }}>{msg}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>{editingCategory ? '✏️ Edit' : '➕ Add'} Category</h3>
                  {editingCategory && <button onClick={() => { setEditingCategory(null); setCatForm({ name: '', label: '', image: null }); }} style={styles.btn('#f3f4f6', '#4b5563')}>Cancel</button>}
                </div>
                <form onSubmit={handleAddCategory}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={styles.label}>Category Name (slug)</label>
                    <input style={styles.input} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={styles.label}>Display Label</label>
                    <input style={styles.input} value={catForm.label} onChange={e => setCatForm({ ...catForm, label: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={styles.label}>Category Image {editingCategory && '(Optional update)'}</label>
                    <input type="file" style={styles.input} onChange={e => setCatForm({ ...catForm, image: e.target.files[0] })} required={!editingCategory} />
                  </div>
                  <button type="submit" style={{ ...styles.btn(colors.accent), width: '100%' }}>{editingCategory ? 'Update' : 'Add'} Category</button>
                </form>
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Existing Categories</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {categories.map(c => (
                    <div key={c._id || c.name} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <img src={c.imagePath ? `http://localhost:5050${c.imagePath}` : '/placeholder.png'} alt={c.label} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700' }}>{c.label}</div>
                        <div style={{ fontSize: '0.75rem', color: colors.textLight }}>Slug: {c.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleCategoryEditClick(c)} style={styles.btn('#e3f2fd', '#1565c0')}>Edit</button>
                        {c._id && (
                          <button onClick={() => handleDeleteCategory(c._id)} style={styles.btn('#fee2e2', '#dc2626')}>Del</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
