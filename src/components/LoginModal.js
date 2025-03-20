import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';
import '../styles/components/LoginModal.css';

const LoginModal = ({ onClose, onRegisterClick }) => {
  const { login } = useContext(UserContext);

  const initialValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    const result = await login(values.username, values.password);
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
        <h2>Login</h2>
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
                <label>Password:</label>
                <Field type="password" name="password" />
                <ErrorMessage name="password" component="div" className="error" />
              </div>
              {errors.submit && <div className="error">{errors.submit}</div>}
              <button type="submit" disabled={isSubmitting}>
                Login
              </button>
            </Form>
          )}
        </Formik>
        <button onClick={onClose}>Close</button>
        <button onClick={onRegisterClick}>Go to Register</button>
      </div>
    </div>
  );
};

export default LoginModal;