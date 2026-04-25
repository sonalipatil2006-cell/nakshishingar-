import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { cartCount, wishlist } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const wishlistCount = wishlist.length;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = !!localStorage.getItem('adminToken');
  const [clickCount, setClickCount] = useState(0);

  // Keyboard shortcut: Alt + A for Admin
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        navigate('/admin');
        return 0;
      }
      return newCount;
    });

    // Reset count if no click for 1 second
    const timer = setTimeout(() => setClickCount(0), 1000);
    return () => clearTimeout(timer);
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <div onClick={handleLogoClick} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
          <span className="logo-text">Nakshishrungar</span>
          <span className="tagline">परंपरेचा साज</span>
        </div>
      </div>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search (e.g. Nath, Jhumka)..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="header-icons">


        <Link to="/customize" className="customize-btn">
          <Sparkles size={18} />
          Customize Order
        </Link>

        <Link to="/liked" className="icon-item" style={{ position: 'relative' }}>
          <Heart size={24} color={wishlistCount > 0 ? 'var(--accent)' : '#333'} fill={wishlistCount > 0 ? 'var(--accent)' : 'none'} />
          <span>Likes</span>
          {wishlistCount > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '5px', background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link to="/orders" className="icon-item">
          <ShoppingBag size={24} />
          <span>Orders</span>
        </Link>

        <Link to="/profile" className="icon-item">
          <User size={24} />
          <span>Account</span>
        </Link>

        <Link to="/cart" className="icon-item" style={{ position: 'relative' }}>
          <ShoppingCart size={24} color={cartCount > 0 ? 'var(--primary)' : '#333'} />
          <span style={{ fontWeight: cartCount > 0 ? '700' : '400' }}>Cart</span>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '5px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
