import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ProductCard.css';

const ProductCard = ({ product }) => {
  // Format price with 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  // Use a reliable placeholder service with smaller dimensions
  const placeholderUrl = `https://placehold.co/200x250/e2e8f0/1e293b?text=${encodeURIComponent(product.name || 'Product')}`;
  
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          <img 
            src={product.image_url || placeholderUrl} 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderUrl;
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
    
    </div>
  );
};

export default ProductCard;