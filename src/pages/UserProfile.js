import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';

const UserProfile = () => {
  const { user, updateProfile } = useContext(UserContext);

  const initialValues = {
    address: user?.address || '',
  };

  const validationSchema = Yup.object({
    address: Yup.string().required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    const result = await updateProfile(values);
    if (result.success) {
      setStatus({ success: 'Profile updated successfully!' });
    } else {
      setStatus({ error: result.error });
    }
    setSubmitting(false);
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <h2>Welcome, {user.username}!</h2>
      <p>Email: {user.email}</p>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <div>
              <label>Address:</label>
              <Field type="text" name="address" />
              <ErrorMessage name="address" component="div" className="error" />
            </div>
            {status?.error && <div className="error">{status.error}</div>}
            {status?.success && <div className="success">{status.success}</div>}
            <button type="submit" disabled={isSubmitting}>
              Update Profile
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserProfile;