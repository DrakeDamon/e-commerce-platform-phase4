import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5555/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
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

  const sizes = product.available_sizes ? JSON.parse(product.available_sizes) : [];
  const colors = product.available_colors ? JSON.parse(product.available_colors) : [];

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.image_url} alt={product.name} style={{ maxWidth: '300px' }} />
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