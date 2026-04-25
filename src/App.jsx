import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import Orders from './pages/Orders';
import Customize from './pages/Customize';
import LikedProducts from './pages/LikedProducts';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import RefundPolicy from './pages/RefundPolicy';
import Footer from './components/Footer';
import './index.css';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Dashboard />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/liked" element={<LikedProducts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
      </Routes>
      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
