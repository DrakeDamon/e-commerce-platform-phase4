import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';
import '../styles/components/RegisterModal.css';

const RegisterModal = ({ onClose, onLoginClick }) => {
  const { register } = useContext(UserContext);

  const initialValues = {
    username: '',
    email: '',
    password: '',
    address: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .max(15, 'Username must be 15 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Required'),
    address: Yup.string(),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    const result = await register(values);
    if (result.success) {
      onClose();
    } else {
      setErrors({ submit: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Register</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <div>
                <label>Username:</label>
                <Field type="text" name="username" />
                <ErrorMessage name="username" component="div" className="error" />
              </div>
              <div>
                <label>Email:</label>
                <Field type="email" name="email" />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div>
                <label>Password:</label>
                <Field type="password" name="password" />
                <ErrorMessage name="password" component="div" className="error" />
              </div>
              <div>
                <label>Address:</label>
                <Field type="text" name="address" />
                <ErrorMessage name="address" component="div" className="error" />
              </div>
              {errors.submit && <div className="error">{errors.submit}</div>}
              <button type="submit" disabled={isSubmitting}>
                Register
              </button>
            </Form>
          )}
        </Formik>
        <button onClick={onClose}>Close</button>
        <button onClick={onLoginClick}>Go to Login</button>
      </div>
    </div>
  );
};

export default RegisterModal;