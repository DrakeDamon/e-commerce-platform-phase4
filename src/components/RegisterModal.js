import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';
import '../styles/components/LoginModal.css';
// Validation schema with Yup
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(15, 'Username cannot exceed 15 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
    .required('Username is required'),
    
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
    
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
    
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
    
  address: Yup.string()
    .min(10, 'Please enter a valid address')
});

const RegisterModal = ({ onClose, onLoginClick }) => {
  const { register } = useContext(UserContext);
  const [registerError, setRegisterError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError(null);
    
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...userData } = values;
    
    const result = await register(userData);
    
    if (result.success) {
      onClose();
    } else {
      setRegisterError(result.error);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Account</h2>
          <button type="button" className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <Formik
            initialValues={{ 
              username: '', 
              email: '', 
              password: '', 
              confirmPassword: '', 
              address: '' 
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
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
                  <label htmlFor="password">Password</label>
                  <Field type="password" name="password" id="password" className="form-control" />
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <Field type="password" name="confirmPassword" id="confirmPassword" className="form-control" />
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Shipping Address</label>
                  <Field as="textarea" name="address" id="address" className="form-control" rows="3" />
                  <ErrorMessage name="address" component="div" className="form-error" />
                </div>
                
                {registerError && (
                  <div className="alert alert-danger">{registerError}</div>
                )}
                
                <div className="form-actions">
                  <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Register'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          
          <div className="modal-footer">
            <p>
              Already have an account?{' '}
              <button type="button" className="link-button" onClick={onLoginClick}>
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;