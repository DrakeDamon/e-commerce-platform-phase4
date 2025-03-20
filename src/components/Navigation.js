import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CartContext } from '../context/CartContext';

const Navigation = ({ onLoginClick, onRegisterClick }) => {
  const { user, logout } = useContext(UserContext);
  const { itemCount } = useContext(CartContext);
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch categories for the navigation menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="brand">
          <Link to="/" className="logo">Stylish</Link>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className="hamburger-icon">☰</span>
        </button>
        
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            
            {categories.length > 0 && (
              <li className="dropdown">
                <button className="dropdown-toggle">Categories</button>
                <ul className="dropdown-menu">
                  {categories.map(category => (
                    <li key={category.id}>
                      <Link 
                        to={`/?category=${category.name}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="header-actions">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search products..." 
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/?search=${e.target.value}`);
                  e.target.value = '';
                }
              }}
            />
            <button className="search-button">
              <span role="img" aria-label="search">🔍</span>
            </button>
          </div>
          
          <div className="user-actions">
            {user ? (
              <div className="user-menu dropdown">
                <button className="dropdown-toggle">
                  {user.username}
                </button>
                <ul className="dropdown-menu">
                  <li><Link to="/profile">My Profile</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-button" onClick={onLoginClick}>Login</button>
                <button className="register-button" onClick={onRegisterClick}>Register</button>
              </div>
            )}
            
            <Link to="/cart" className="cart-button">
              <span role="img" aria-label="cart">🛒</span>
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;