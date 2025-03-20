import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css'; // This exists in src/styles/
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Footer from './components/Footer';
import { FilterProvider } from './context/FilterContext';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  return (
    <Router>
      <UserProvider>
        <CartProvider>
          <FilterProvider>
            <div className="app-container">
              <Navigation
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
              />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<UserProfile />} />
                </Routes>
              </main>
              <Footer />
              {showLoginModal && (
                <LoginModal
                  onClose={() => setShowLoginModal(false)}
                  onRegisterClick={handleRegisterClick}
                />
              )}
              {showRegisterModal && (
                <RegisterModal
                  onClose={() => setShowRegisterModal(false)}
                  onLoginClick={handleLoginClick}
                />
              )}
            </div>
          </FilterProvider>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;