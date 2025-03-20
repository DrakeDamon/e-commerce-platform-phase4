import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CartContext } from '../context/CartContext';
import { FilterContext } from '../context/FilterContext';
import '../styles/components/Navigation.css';

const Navigation = ({ onLoginClick, onRegisterClick }) => {
  const { user, logout } = useContext(UserContext);
  const { itemCount } = useContext(CartContext);
  const { categories, setSelectedCategory, setSelectedSubcategory, setSearchTerm } = useContext(FilterContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSearchTerm(''); // Clear search term when changing category
    setIsMenuOpen(false);
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSearchTerm(''); // Clear search term when changing subcategory
    setIsMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term); // Update search term as the user types
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="brand">
          <Link to="/" className="logo">Thrift Hub</Link>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className="hamburger-icon">☰</span>
        </button>

        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/" onClick={() => handleCategoryClick('All')}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/" onClick={() => handleCategoryClick('All')}>
                All
              </Link>
            </li>
            {categories.map(category => (
              <li key={category.id} className={category.subcategories.length > 0 ? 'dropdown' : ''}>
                {category.subcategories.length > 0 ? (
                  <>
                    <button className="dropdown-toggle">{category.name}</button>
                    <ul className="dropdown-menu">
                      {category.subcategories.map(subcategory => (
                        <li key={subcategory.id}>
                          <Link
                            to="/"
                            onClick={() => {
                              setSelectedCategory(category.name);
                              handleSubcategoryClick(subcategory.name);
                            }}
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    to="/"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              onChange={handleSearchChange} // Update search term on every keystroke
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