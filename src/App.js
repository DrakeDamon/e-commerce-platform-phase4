import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

// Context
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Navigation 
              onLoginClick={() => setShowLoginModal(true)}
              onRegisterClick={() => setShowRegisterModal(true)}
            />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
            </main>
            
            <Footer />
            
            {showLoginModal && (
              <LoginModal 
                onClose={() => setShowLoginModal(false)}
                onRegisterClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
              />
            )}
            
            {showRegisterModal && (
              <RegisterModal 
                onClose={() => setShowRegisterModal(false)}
                onLoginClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
              />
            )}
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;