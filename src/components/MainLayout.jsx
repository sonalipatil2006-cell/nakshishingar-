import React from 'react';
import Header from './Header';
import Footer from './Footer';

import { MessageCircle } from 'lucide-react';

const MainLayout = ({ children }) => {
    return (
        <div className="layout-wrapper" style={{ position: 'relative' }}>
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />

            {/* Floating WhatsApp Button */}
            <a 
                href="https://wa.me/919769463588" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: '#25d366',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    transition: 'transform 0.3s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageCircle size={32} />
            </a>
        </div>
    );
};

export default MainLayout;
