import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin, ShieldCheck, MessageCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="main-footer-section">
            <div className="footer-container">
                {/* Company Info */}
                <div className="footer-col">
                    <h3 className="footer-logo">Nakshishrungar</h3>
                    <p className="footer-about">
                        Discover the elegance of traditional Maharashtrian jewellery.
                        Each piece is handcrafted with love to make your special moments timeless.
                    </p>
                    <div className="social-links">
                        <a href="https://www.instagram.com/ns_nakshishringar/" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        <a href="https://wa.me/919769463588" target="_blank" rel="noopener noreferrer"><MessageCircle size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/dashboard">Home</Link></li>
                        <li><Link to="/orders">My Orders</Link></li>
                        <li><Link to="/cart">Shopping Cart</Link></li>
                        <li><Link to="/liked">Wishlist</Link></li>
                        <li><Link to="/customize">Custom Orders</Link></li>
                        <li><Link to="/refund-policy" style={{ color: '#d32f2f', fontWeight: 'bold' }}>Return & Refund Policy</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div className="footer-col">
                    <h4>Categories</h4>
                    <ul>
                        <li><Link to="/category/nath">Nath Collection</Link></li>
                        <li><Link to="/category/mangalsutra">Mangalsutra</Link></li>
                        <li><Link to="/category/choker">Choker Sets</Link></li>
                        <li><Link to="/category/jhumka">Jhumkas</Link></li>
                        <li><Link to="/category/earcuff">Ear Cuffs</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="footer-col">
                    <h4>Contact Us</h4>
                    <div className="contact-item">
                        <Phone size={16} />
                        <span>+91 97694 63588</span>
                    </div>
                    <div className="contact-item">
                        <Mail size={16} />
                        <span>contact@nakshishrungar.com</span>
                    </div>
                    <div className="contact-item">
                        <MapPin size={16} />
                        <span>Ghatkopar, Mumbai, Maharashtra</span>
                    </div>
                    <div className="admin-link-footer">
                        <Link to="/admin">
                            <ShieldCheck size={14} /> Admin Access
                        </Link>
                    </div>
                </div>
            </div>

            <div className="footer-trust-badges" style={{ textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <ShieldCheck size={20} color="#2e7d32" /> <span>Secure Payment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <MapPin size={20} color="#c62828" /> <span>Pan India Delivery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <MessageCircle size={20} color="#1976d2" /> <span>Easy Returns</span>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Nakshishrungar. All rights reserved.</p>
                <p className="made-with">Crafted with 🌸 in Maharashtra</p>
            </div>
        </footer>
    );
};

export default Footer;
