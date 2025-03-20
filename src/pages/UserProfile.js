import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';

// Validation schema for profile form
const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(15, 'Username cannot exceed 15 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    
  email: Yup.string()
    .email('Invalid email address'),
    
  address: Yup.string()
    .min(10, 'Please enter a valid address'),
    
  currentPassword: Yup.string()
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Current password is required to set a new password')
    }),
    
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
    
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
});

const UserProfile = () => {
  const { user, updateProfile, logout } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Fetch user orders
  useEffect(() => {
    if (user && activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/orders', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          
          const data = await response.json();
          setOrders(data);
        } catch (err) {
          setError(err.message);
          console.error('Error fetching orders:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrders();
    }
  }, [user, activeTab]);
  
  const handleProfileUpdate = async (values, { setSubmitting, resetForm }) => {
    setUpdateSuccess(false);
    setError(null);
    
    const updatedData = {
      username: values.username,
      email: values.email,
      address: values.address
    };
    
    // Include password update if provided
    if (values.newPassword) {
      updatedData.password = values.newPassword;
      // Note: Current password validation would happen on the backend
    }
    
    const result = await updateProfile(updatedData);
    
    if (result.success) {
      setUpdateSuccess(true);
      
      // Reset password fields
      resetForm({
        values: {
          ...values,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } else {
      setError(result.error);
    }
    
    setSubmitting(false);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Account</h1>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-form-container">
              <h2>Profile Information</h2>
              
              <Formik
                initialValues={{
                  username: user.username || '',
                  email: user.email || '',
                  address: user.address || '',
                  currentPassword: '',
                  newPassword: '',
                  confirmNewPassword: ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileUpdate}
              >
                {({ isSubmitting }) => (
                  <Form className="profile-form">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <Field type="text" name="username" id="username" className="form-control" />
                      <ErrorMessage name="username" component="div" className="form-error" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <Field type="email" name="email" id="email" className="form-control" />
                      <ErrorMessage name="email" component="div" className="form-error" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address">Shipping Address</label>
                      <Field as="textarea" name="address" id="address" className="form-control" rows="3" />
                      <ErrorMessage name="address" component="div" className="form-error" />
                    </div>
                    
                    <h3>Change Password (Optional)</h3>
                    
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <Field type="password" name="currentPassword" id="currentPassword" className="form-control" />
                      <ErrorMessage name="currentPassword" component="div" className="form-error" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <Field type="password" name="newPassword" id="newPassword" className="form-control" />
                      <ErrorMessage name="newPassword" component="div" className="form-error" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmNewPassword">Confirm New Password</label>
                      <Field type="password" name="confirmNewPassword" id="confirmNewPassword" className="form-control" />
                      <ErrorMessage name="confirmNewPassword" component="div" className="form-error" />
                    </div>
                    
                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}
                    
                    {updateSuccess && (
                      <div className="alert alert-success">Profile updated successfully!</div>
                    )}
                    
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="update-profile-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-container">
              <h2>Order History</h2>
              
              {loading ? (
                <div className="loading-spinner">Loading orders...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : orders.length === 0 ? (
                <div className="no-orders-message">
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    className="start-shopping-btn"
                    onClick={() => navigate('/')}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>Order #{order.id}</h3>
                          <p className="order-date">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.get_items().map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-details">
                              <p className="item-name">{item.name || `Product #${item.product_id}`}</p>
                              <p className="item-options">
                                Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="item-price">
                              {formatCurrency(item.price_at_purchase * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-address">
                          <h4>Shipping Address:</h4>
                          <p>{order.shipping_address}</p>
                        </div>
                        <div className="order-total">
                          <p>Total: {formatCurrency(order.total_amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;