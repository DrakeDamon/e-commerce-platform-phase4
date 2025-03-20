import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ProductCard.css';
const ProductCard = ({ product }) => {
  // Format price with 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          <img 
            src={product.image_url || '/placeholder-image.jpg'} 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{formattedPrice}</p>
          
          {/* Check if inventory is low */}
          {product.inventory_count < 5 && product.inventory_count > 0 && (
            <p className="product-inventory-low">Only {product.inventory_count} left!</p>
          )}
          
          {/* Show out of stock message */}
          {product.inventory_count === 0 && (
            <p className="product-out-of-stock">Out of stock</p>
          )}
        </div>
      </Link>
      
      <div className="product-actions">
        <Link to={`/products/${product.id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;