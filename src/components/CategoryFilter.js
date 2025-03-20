import React from 'react';
import '../styles/components/CategoryFilter.css';
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      <h3>Categories</h3>
      <ul className="category-list">
        {/* "All" option that deselects any category */}
        <li className="category-item">
          <button 
            className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => onCategoryChange(null)}
          >
            All Products
          </button>
        </li>
        
        {/* Map through available categories */}
        {categories.map(category => (
          <li key={category.id} className="category-item">
            <button 
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;