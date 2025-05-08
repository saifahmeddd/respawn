import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      console.log('Initializing cart from localStorage');
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Loaded cart from localStorage:', savedCart);
      
      // Validate cart items
      const validCart = savedCart.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
      
      console.log('Validated cart:', validCart);
      setCart(validCart);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCart([]);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!initialized) return;
    
    try {
      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart, initialized]);

  const addToCart = (game) => {
    if (!game || !game.id) {
      console.error('Invalid game object:', game);
      return;
    }

    console.log('Adding to cart:', game);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === game.id);
      let newCart;

      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('Updated cart (existing item):', newCart);
      } else {
        newCart = [...prevCart, { ...game, quantity: 1 }];
        console.log('Updated cart (new item):', newCart);
      }

      return newCart;
    });
  };

  const removeFromCart = (gameId) => {
    if (!gameId) {
      console.error('Invalid gameId:', gameId);
      return;
    }

    console.log('Removing from cart:', gameId);
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== gameId);
      console.log('Updated cart after removal:', newCart);
      return newCart;
    });
  };

  const updateQuantity = (gameId, newQuantity) => {
    if (!gameId || typeof newQuantity !== 'number' || newQuantity < 1) {
      console.error('Invalid update quantity parameters:', { gameId, newQuantity });
      return;
    }

    console.log('Updating quantity:', { gameId, newQuantity });
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === gameId
          ? { ...item, quantity: newQuantity }
          : item
      );
      console.log('Updated cart after quantity change:', newCart);
      return newCart;
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      return total + itemTotal;
    }, 0);
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
    localStorage.removeItem('cart');
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    initialized
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 