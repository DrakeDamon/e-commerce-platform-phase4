import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5555/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading-spinner">Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="home">
      <div className="products-grid">
        {products.length === 0 ? (
          <p className="no-products-message">No products found.</p>
        ) : (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;