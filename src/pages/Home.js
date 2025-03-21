import React from 'react';
import { Link } from 'react-router-dom';
import { useFilterContext } from '../context/FilterContext';
import { useCartContext } from '../context/CartContext';
import '../styles/pages/Home.css';

const Home = () => {
  const { products, selectedCategory, selectedSubcategory, searchTerm, loading, error } = useFilterContext();
  const { addToCart } = useCartContext();

  // Deduplicate products by id
  const uniqueProducts = Array.from(
    new Map(products.map(product => [product.id, product])).values()
  );

  const filteredProducts = uniqueProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || (product.category && product.category.includes(selectedCategory));
    const matchesSubcategory = !selectedSubcategory || (product.subcategory && product.subcategory === selectedSubcategory);
    const matchesSearch = searchTerm ? product.name.toLowerCase().startsWith(searchTerm.toLowerCase()) : true;
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  if (loading) return <div className="loading-spinner">Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="home">
      <div className="products">
        {filteredProducts.length === 0 ? (
          <p className="no-products-message">No products found.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>Price: ${product.price.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;