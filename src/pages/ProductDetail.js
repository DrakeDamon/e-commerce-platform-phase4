import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';

// Validation schema for add to cart form
const AddToCartSchema = Yup.object().shape({
  size: Yup.string().required('Please select a size'),
  color: Yup.string().required('Please select a color'),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum quantity is 10')
});

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = (values, { resetForm }) => {
    if (!product) return;
    
    addToCart(
      product,
      parseInt(values.quantity, 10),
      values.size,
      values.color
    );
    
    // Show success message
    setAddedToCart(true);
    
    // Reset form
    resetForm();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading product details...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/')}>
          Back to Products
        </button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button className="btn" onClick={() => navigate('/')}>
          Back to Products
        </button>
      </div>
    );
  }
  
  // Format price with 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  // Parse sizes and colors from JSON
  const sizes = product.get_sizes ? product.get_sizes() : [];
  const colors = product.get_colors ? product.get_colors() : [];
  
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-gallery">
          <img 
            src={product.image_url || '/placeholder-image.jpg'} 
            alt={product.name}
            className="product-main-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{formattedPrice}</p>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {product.inventory_count > 0 ? (
            <Formik
              initialValues={{
                size: '',
                color: '',
                quantity: 1
              }}
              validationSchema={AddToCartSchema}
              onSubmit={handleAddToCart}
            >
              {({ isSubmitting }) => (
                <Form className="product-form">
                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <Field as="select" name="size" className="form-control">
                      <option value="">Select Size</option>
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="size" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <Field as="select" name="color" className="form-control">
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="color" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <Field
                      type="number"
                      name="quantity"
                      min="1"
                      max={product.inventory_count}
                      className="form-control"
                    />
                    <ErrorMessage name="quantity" component="div" className="form-error" />
                  </div>
                  
                  <div className="inventory-status">
                    {product.inventory_count < 5 ? (
                      <p className="low-stock-warning">Only {product.inventory_count} left in stock!</p>
                    ) : (
                      <p className="in-stock">In Stock</p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="add-to-cart-btn"
                    disabled={isSubmitting}
                  >
                    Add to Cart
                  </button>
                  
                  {addedToCart && (
                    <div className="success-message">
                      Product added to cart!
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          ) : (
            <div className="out-of-stock-message">
              <p>Sorry, this product is currently out of stock.</p>
              <button 
                className="back-to-products-btn"
                onClick={() => navigate('/')}
              >
                Back to Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;