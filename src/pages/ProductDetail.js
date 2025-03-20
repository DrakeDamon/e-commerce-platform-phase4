import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.image_url} alt={product.name} style={{ maxWidth: '300px' }} />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Inventory: {product.inventory_count}</p>
      <p>Sizes: {product.available_sizes ? JSON.parse(product.available_sizes).join(', ') : 'N/A'}</p>
      <p>Colors: {product.available_colors ? JSON.parse(product.available_colors).join(', ') : 'N/A'}</p>
      <button>Add to Cart</button> {/* Placeholder for cart functionality */}
    </div>
  );
};

export default ProductDetail;