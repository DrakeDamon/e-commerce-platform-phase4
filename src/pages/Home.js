import React, { useEffect, useState, useContext } from 'react';
import { FilterContext } from '../context/FilterContext'; // Correct path
import '../styles/pages/Home.css'; // Correct path

function Home() {
  const [products, setProducts] = useState([]);
  const { selectedCategory, selectedSubcategory } = useContext(FilterContext);

  useEffect(() => {
    let url = `http://localhost:5555/products?category=${selectedCategory}`;
    if (selectedSubcategory) {
      url += `&subcategory=${selectedSubcategory}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, [selectedCategory, selectedSubcategory]);

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Stylish Clothing</h1>
          <p>Discover the latest fashion trends</p>
        </div>
      </section>
      <div className="content-container">
        <div className="products-container">
          <div className="search-results-header">
            <h2>All Products</h2>
          </div>
          {products.length === 0 ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price}</p>
                  </div>
                  <div className="product-actions">
                    <a href={`/products/${product.id}`} className="view-details-btn">View Details</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;