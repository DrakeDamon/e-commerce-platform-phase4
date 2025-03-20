import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';

// Validation schema for checkout form
const CheckoutSchema = Yup.object().shape({
  shippingAddress: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .required('Shipping address is required')
});

const Cart = () => {
  const { cart, itemCount, totalPrice, updateQuantity, removeFromCart, checkout } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'confirmation'
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const handleQuantityChange = (index, newQuantity) => {
    updateQuantity(index, parseInt(newQuantity, 10));
  };
  
  const handleRemoveItem = (index) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeFromCart(index);
    }
  };
  
  const handleCheckout = async (values) => {
    if (!user) {
      setCheckoutError('You must be logged in to checkout');
      return;
    }
    
    const result = await checkout(values.shippingAddress);
    
    if (result.success) {
      setOrderConfirmation(result.order);
      setCheckoutStep('confirmation');
      setCheckoutError(null);
    } else {
      setCheckoutError(result.error);
    }
  };
  
  if (checkoutStep === 'confirmation' && orderConfirmation) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-container">
          <div className="confirmation-header">
            <h1>Thank You for Your Order!</h1>
            <div className="success-checkmark">✓</div>
          </div>
          
          <div className="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {orderConfirmation.id}</p>
            <p><strong>Order Date:</strong> {new Date(orderConfirmation.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(orderConfirmation.total_amount)}</p>
            <p><strong>Status:</strong> {orderConfirmation.status}</p>
            <p><strong>Shipping Address:</strong> {orderConfirmation.shipping_address}</p>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="primary-button"
              onClick={() => navigate('/profile')}
            >
              View Your Orders
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-container">
          <h1>Your Shopping Cart is Empty</h1>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="continue-shopping-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        {checkoutStep === 'cart' ? (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.image_url || '/placeholder-image.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">{formatCurrency(item.price)}</p>
                    <p className="item-options">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    
                    <div className="item-actions">
                      <div className="quantity-selector">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-totals">
                <div className="cart-subtotal">
                  <span>Subtotal ({itemCount} items):</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="cart-shipping">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="cart-total">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              
              <div className="cart-actions">
                <button 
                  className="checkout-btn"
                  onClick={() => {
                    if (user) {
                      setCheckoutStep('checkout');
                    } else {
                      setCheckoutError('You must be logged in to checkout');
                    }
                  }}
                >
                  Proceed to Checkout
                </button>
                
                <Link to="/" className="continue-shopping-link">
                  Continue Shopping
                </Link>
              </div>
              
              {checkoutError && (
                <div className="checkout-error">
                  {checkoutError}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="checkout-form-container">
            <h2>Shipping Information</h2>
            
            <Formik
              initialValues={{
                shippingAddress: user?.address || ''
              }}
              validationSchema={CheckoutSchema}
              onSubmit={handleCheckout}
            >
              {({ isSubmitting }) => (
                <Form className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="shippingAddress">Shipping Address</label>
                    <Field 
                      as="textarea" 
                      name="shippingAddress" 
                      className="form-control"
                      rows="3"
                    />
                    <ErrorMessage name="shippingAddress" component="div" className="form-error" />
                  </div>
                  
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-items">
                      {cart.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="summary-item">
                          <span>
                            {item.name} ({item.size}, {item.color}) x {item.quantity}
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="summary-total">
                      <span>Total:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                  
                  {checkoutError && (
                    <div className="checkout-error">
                      {checkoutError}
                    </div>
                  )}
                  
                  <div className="checkout-actions">
                    <button 
                      type="button" 
                      className="back-to-cart-btn"
                      onClick={() => setCheckoutStep('cart')}
                    >
                      Back to Cart
                    </button>
                    
                    <button 
                      type="submit" 
                      className="place-order-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;