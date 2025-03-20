import React, { createContext, useState, useEffect } from 'react';
// Manages shopping cart state and checkout process
// Create the context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Total item count for cart badge
  const [itemCount, setItemCount] = useState(0);
  
  // Total price for checkout
  const [totalPrice, setTotalPrice] = useState(0);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update item count and total price
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
    
    const price = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    setTotalPrice(price);
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size, color) => {
    setCart(prevCart => {
      // Check if this exact product (with same size/color) already exists in cart
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && item.size === size && item.color === color
      );
      
      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity,
          size,
          color
        }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (index, quantity) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = quantity;
      
      // If quantity is 0, remove the item
      if (quantity <= 0) {
        updatedCart.splice(index, 1);
      }
      
      return updatedCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Create order from cart
  const checkout = async (shippingAddress) => {
    // Format cart items for the order
    const orderItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
      size: item.size,
      color: item.color
    }));
    
    // Calculate total (should match totalPrice state)
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total_amount: total,
          shipping_address: shippingAddress,
          items: orderItems
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
      
      const order = await response.json();
      
      // Clear cart after successful checkout
      clearCart();
      
      return { success: true, order };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      itemCount, 
      totalPrice, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      checkout 
    }}>
      {children}
    </CartContext.Provider>
  );
};