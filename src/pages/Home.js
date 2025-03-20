import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const location = useLocation();
  
  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      // Get URL search parameters
      const queryParams = new URLSearchParams(location.search);
      const categoryParam = queryParams.get('category');
      const searchParam = queryParams.get('search');
      
      // If category provided in URL, select it
      if (categoryParam && categories.length > 0) {
        const category = categories.find(c => c.name === categoryParam);
        if (category) {
          setSelectedCategory(category.id);
        }
      }
      
      // Build API URL with filters
      let url = '/products';
      const params = new URLSearchParams();
      
      if (categoryParam) {
        params.append('category', categoryParam);
      }
      
      if (searchParam) {
        params.append('search', searchParam);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [location.search, categories]);
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Find category name by ID
    const category = categories.find(c => c.id === categoryId);
    
    // Update URL to reflect selected category
    if (category) {
      const url = new URL(window.location);
      url.searchParams.set('category', category.name);
      window.history.pushState({}, '', url);
    } else {
      // If "All" is selected, remove category parameter
      const url = new URL(window.location);
      url.searchParams.delete('category');
      window.history.pushState({}, '', url);
    }
    
    // The URL change will trigger the useEffect to fetch products
  };
  
  // Extract search term from URL for display
  const searchTerm = new URLSearchParams(location.search).get('search');
  
  return (
    <div className="home-page">
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Stylish Clothing</h1>
          <p>Discover the latest fashion trends</p>
        </div>
      </div>
      
      <div className="content-container">
        <aside className="sidebar">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange} 
          />
        </aside>
        
        <main className="products-container">
          {searchTerm && (
            <div className="search-results-header">
              <h2>Search results for: "{searchTerm}"</h2>
            </div>
          )}
          
          {loading ? (
            <div className="loading-spinner">Loading products...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : products.length === 0 ? (
            <div className="no-products-message">
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;