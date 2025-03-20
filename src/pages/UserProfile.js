import React, { useState, useEffect, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';

const UserProfile = () => {
  const { user, updateProfile } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5555/orders', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

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

      <h2>Order History</h2>
      {loading && <div>Loading orders...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && orders.length === 0 && <div>No orders found.</div>}
      {!loading && !error && orders.length > 0 && (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order #{order.id} - Status: {order.status}, Total: ${order.total_amount}
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    Product ID: {item.product_id}, Quantity: {item.quantity}, Price: ${item.price_at_purchase}, Size: {item.size}, Color: {item.color}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserProfile;