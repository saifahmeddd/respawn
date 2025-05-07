import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const initializeCart = () => {
      try {
        console.log('Initializing cart...');
        const savedCart = localStorage.getItem('cart');
        console.log('Raw saved cart:', savedCart);

        if (!savedCart) {
          console.log('No saved cart found, initializing empty cart');
          setCart([]);
          setInitialized(true);
          return;
        }

        let parsedCart;
        try {
          parsedCart = JSON.parse(savedCart);
        } catch (parseError) {
          console.error('Error parsing cart data:', parseError);
          setCart([]);
          setError('Invalid cart data format');
          setInitialized(true);
          return;
        }

        console.log('Parsed cart:', parsedCart);
        
        // Validate cart items
        if (!Array.isArray(parsedCart)) {
          console.error('Cart data is not an array:', parsedCart);
          setCart([]);
          setError('Invalid cart data structure');
          setInitialized(true);
          return;
        }

        const validCart = parsedCart.filter(item => {
          const isValid = item && 
            typeof item === 'object' && 
            item.id && 
            typeof item.quantity === 'number' && 
            item.quantity > 0 &&
            typeof item.price === 'number' &&
            item.price >= 0;
          
          if (!isValid) {
            console.warn('Invalid cart item found:', item);
            console.warn('Validation failed for:', {
              isObject: typeof item === 'object',
              hasId: !!item?.id,
              hasValidQuantity: typeof item?.quantity === 'number' && item?.quantity > 0,
              hasValidPrice: typeof item?.price === 'number' && item?.price >= 0
            });
          }
          return isValid;
        });
        
        console.log('Validated cart:', validCart);
        setCart(validCart);
        setError(null);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setCart([]);
        setError('Failed to load cart data');
      } finally {
        setInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!initialized) {
      console.log('Cart not initialized yet, skipping save');
      return;
    }
    
    try {
      if (!Array.isArray(cart)) {
        console.error('Attempting to save invalid cart data:', cart);
        return;
      }

      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
      setError(null);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError('Failed to save cart data');
    }
  }, [cart, initialized]);

  const addToCart = useCallback((game) => {
    console.log('Adding to cart:', game);
    
    if (!game?.id) {
      console.error('Invalid game data:', game);
      setError('Invalid game data');
      return;
    }

    // Validate game data
    if (typeof game.price !== 'number' || game.price < 0) {
      console.error('Invalid game price:', game.price);
      setError('Invalid game price');
      return;
    }

    setCart(prevCart => {
      if (!Array.isArray(prevCart)) {
        console.error('Previous cart is not an array:', prevCart);
        return [{ ...game, quantity: 1 }];
      }

      const existingItem = prevCart.find(item => item.id === game.id);
      
      if (existingItem) {
        const newCart = prevCart.map(item =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('Updated cart (existing item):', newCart);
        return newCart;
      }
      
      const newCart = [...prevCart, { ...game, quantity: 1 }];
      console.log('Updated cart (new item):', newCart);
      return newCart;
    });
    setError(null);
  }, []);

  const removeFromCart = useCallback((gameId) => {
    console.log('Removing from cart:', gameId);
    
    if (!gameId) {
      console.error('Invalid gameId:', gameId);
      setError('Invalid game ID');
      return;
    }

    setCart(prevCart => {
      if (!Array.isArray(prevCart)) {
        console.error('Previous cart is not an array:', prevCart);
        return [];
      }

      const newCart = prevCart.filter(item => item.id !== gameId);
      console.log('Updated cart after removal:', newCart);
      return newCart;
    });
    setError(null);
  }, []);

  const updateQuantity = useCallback((gameId, newQuantity) => {
    console.log('Updating quantity:', { gameId, newQuantity });
    
    if (!gameId || typeof newQuantity !== 'number' || newQuantity < 1) {
      console.error('Invalid update quantity parameters:', { gameId, newQuantity });
      setError('Invalid quantity');
      return;
    }

    setCart(prevCart => {
      if (!Array.isArray(prevCart)) {
        console.error('Previous cart is not an array:', prevCart);
        return [];
      }

      const newCart = prevCart.map(item =>
        item.id === gameId
          ? { ...item, quantity: newQuantity }
          : item
      );
      console.log('Updated cart after quantity change:', newCart);
      return newCart;
    });
    setError(null);
  }, []);

  const calculateTotal = useCallback(() => {
    if (!Array.isArray(cart)) {
      console.error('Cart is not an array:', cart);
      return 0;
    }

    const total = cart.reduce((total, item) => {
      if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        console.warn('Invalid item price or quantity:', item);
        return total;
      }
      return total + (item.price * item.quantity);
    }, 0);
    
    console.log('Calculated total:', total);
    return total;
  }, [cart]);

  const clearCart = useCallback(() => {
    console.log('Clearing cart');
    setCart([]);
    localStorage.removeItem('cart');
    setError(null);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    initialized,
    error
  }), [cart, addToCart, removeFromCart, updateQuantity, calculateTotal, clearCart, initialized, error]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 