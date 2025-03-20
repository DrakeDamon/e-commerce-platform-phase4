import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required'),
  password: Yup.string()
    .required('Password is required')
});

const LoginModal = ({ onClose, onRegisterClick }) => {
  const { login } = useContext(UserContext);
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    const result = await login(values.username, values.password);
    
    if (result.success) {
      onClose();
    } else {
      setLoginError(result.error);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Login</h2>
          <button type="button" className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={LoginSchema}
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
                  <label htmlFor="password">Password</label>
                  <Field type="password" name="password" id="password" className="form-control" />
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>
                
                {loginError && (
                  <div className="alert alert-danger">{loginError}</div>
                )}
                
                <div className="form-actions">
                  <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          
          <div className="modal-footer">
            <p>
              Don't have an account?{' '}
              <button type="button" className="link-button" onClick={onRegisterClick}>
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;