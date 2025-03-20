import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Stylish</h3>
          <p>Your destination for quality clothing and fashion accessories.</p>
        </div>
        
        <div className="footer-section">
          <h4>Shop</h4>
          <ul className="footer-links">
            <li><Link to="/?category=Men's Clothing">Men's Clothing</Link></li>
            <li><Link to="/?category=Women's Clothing">Women's Clothing</Link></li>
            <li><Link to="/?category=Accessories">Accessories</Link></li>
            <li><Link to="/">New Arrivals</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul className="footer-links">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping & Returns</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>My Account</h4>
          <ul className="footer-links">
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Stylish Clothing Store. All rights reserved.</p>
        <div className="footer-legal-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;