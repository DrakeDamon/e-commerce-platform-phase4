import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart } = useCartContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5555/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        console.log("Fetched product data:", data); // Debug log
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }
    addToCart(product, 1, selectedSize, selectedColor);
    alert('Product added to cart!');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  console.log("Product sizes:", product.available_sizes); // Debug log
  console.log("Product colors:", product.available_colors); // Debug log

  // Handle different formats or missing data for sizes
  let sizes = [];
  if (product.available_sizes) {
    if (typeof product.available_sizes === 'string') {
      try {
        // Try to parse as JSON
        sizes = JSON.parse(product.available_sizes);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        sizes = product.available_sizes.split(',').map(size => size.trim());
      }
    } else if (Array.isArray(product.available_sizes)) {
      // It's already an array
      sizes = product.available_sizes;
    }
  }

  // Handle different formats or missing data for colors
  let colors = [];
  if (product.available_colors) {
    if (typeof product.available_colors === 'string') {
      try {
        // Try to parse as JSON
        colors = JSON.parse(product.available_colors);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        colors = product.available_colors.split(',').map(color => color.trim());
      }
    } else if (Array.isArray(product.available_colors)) {
      // It's already an array
      colors = product.available_colors;
    }
  }

  // Fallback defaults if we still don't have sizes or colors
  if (!sizes.length) sizes = ['S', 'M', 'L', 'XL'];
  if (!colors.length) colors = ['Black', 'White', 'Blue'];

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img 
        src={product.image_url || 'https://placehold.co/400/e2e8f0/1e293b?text=Product'} 
        alt={product.name} 
        style={{ maxWidth: '300px' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/400/e2e8f0/1e293b?text=Product';
        }}
      />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Inventory: {product.inventory_count}</p>
      <div>
        <label>Size:</label>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          <option value="">Select a size</option>
          {sizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Color:</label>
        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
          <option value="">Select a color</option>
          {colors.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </div>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductDetail;