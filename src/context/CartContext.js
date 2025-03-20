import React, { createContext, useState, useContext } from 'react';
import { UserContext } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(UserContext);

  const addToCart = (product, quantity = 1, size, color) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity, size, color }];
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const checkout = async () => {
    if (!user) {
      return { success: false, error: 'Please log in to checkout' };
    }
    if (cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
        size: item.size,
        color: item.color,
      }));

      const totalAmount = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      const response = await fetch('http://localhost:5555/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_amount: totalAmount,
          shipping_address: user.address,
          items: orderItems,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout failed');
      }

      setCartItems([]); // Clear cart on successful checkout
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, checkout, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};