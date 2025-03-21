import React, { useState, useEffect, useContext } from 'react';
import { useUserContext } from './UserContext';

export const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useUserContext();

  const addToCart = (product, quantity, size, color) => {
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

  const placeOrder = async () => {
    if (!user) {
      throw new Error('You must be logged in to place an order');
    }
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderData = {
      user_id: user.id,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    };

    try {
      const response = await fetch('http://localhost:5555/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();
      setCartItems([]); // Clear cart after successful order
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (!user) {
      clearCart();
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, placeOrder, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  return useContext(CartContext);
};