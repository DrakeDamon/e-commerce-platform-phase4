import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, checkout, itemCount } = useContext(CartContext);
  const [message, setMessage] = useState(null);

  const handleCheckout = async () => {
    const result = await checkout();
    if (result.success) {
      setMessage('Checkout successful! Your order has been placed.');
    } else {
      setMessage(`Checkout failed: ${result.error}`);
    }
  };

  if (itemCount === 0) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div className="cart">
      <h1>Shopping Cart</h1>
      {message && <div className={message.includes('failed') ? 'error' : 'success'}>{message}</div>}
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.product.name} - Size: {item.size}, Color: {item.color}, Quantity: {item.quantity}, Price: ${item.product.price * item.quantity}
            <button onClick={() => removeFromCart(item.product.id, item.size, item.color)}>Remove</button>
          </li>
        ))}
      </ul>
      <p>Total Items: {itemCount}</p>
      <p>Total Price: ${cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)}</p>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default Cart;