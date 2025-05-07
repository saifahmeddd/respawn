import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImage } from '../utils/imageMapping';
import { motion, AnimatePresence } from 'framer-motion';

// Import all game images
import eldenringImg from "../assets/images/eldenring.jpeg";
import godofwarImg from "../assets/images/godofwar.jpg";
import gta5Img from "../assets/images/gta5.jpeg";
import rdr2Img from "../assets/images/rdr2.jpeg";
import lolImg from "../assets/images/lol.jpeg";
import tekken8Img from "../assets/images/tekken8.jpeg";
import overwatchImg from "../assets/images/overwatch.jpeg";
import codb06Img from "../assets/images/codb06.jpeg";
import minecraftImg from "../assets/images/minecraft.png";
import lou1Img from "../assets/images/lou1.jpeg";
import lou2Img from "../assets/images/lou2.jpg";
import legoRobloxImg from "../assets/images/lego-roblox-video-game-3840x2160-14270.jpg";
import venomImg from "../assets/images/venom-spider-man-5120x2880-13179.jpg";
import fortniteImg from "../assets/images/fortnite-street-striker-outfit-skin-3840x2160-488.jpg";
import yasukeImg from "../assets/images/yasuke-naoe-3840x2160-21870.jpg";
import racingImg from "../assets/images/racing.jpg";
import racing2Img from "../assets/images/racing2.jpg";
import racing5Img from "../assets/images/racing5.jpg";
import racing6Img from "../assets/images/racing6.jpg";
import racingBlurImg from "../assets/images/racing-blur.jpg";
import defaultImg from "../assets/images/images.jpeg";

// Create an image mapping object
const imageMap = {
  "eldenring.jpeg": eldenringImg,
  "godofwar.jpg": godofwarImg,
  "gta5.jpeg": gta5Img,
  "rdr2.jpeg": rdr2Img,
  "lol.jpeg": lolImg,
  "tekken8.jpeg": tekken8Img,
  "overwatch.jpeg": overwatchImg,
  "codb06.jpeg": codb06Img,
  "minecraft.png": minecraftImg,
  "lou1.jpeg": lou1Img,
  "lou2.jpg": lou2Img,
  "lego-roblox-video-game-3840x2160-14270.jpg": legoRobloxImg,
  "venom-spider-man-5120x2880-13179.jpg": venomImg,
  "fortnite-street-striker-outfit-skin-3840x2160-488.jpg": fortniteImg,
  "yasuke-naoe-3840x2160-21870.jpg": yasukeImg,
  "racing.jpg": racingImg,
  "racing2.jpg": racing2Img,
  "racing5.jpg": racing5Img,
  "racing6.jpg": racing6Img,
  "racing-blur.jpg": racingBlurImg,
  "default": defaultImg,
};

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, calculateTotal, initialized, error: cartError, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the total calculation
  const total = useMemo(() => calculateTotal(), [calculateTotal]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Cart state:', { 
          cart, 
          initialized, 
          currentUser,
          cartLength: cart?.length,
          cartItems: cart
        });

        if (!currentUser) {
          console.log('No current user, clearing cart items');
          setCartItems([]);
          setLoading(false);
          return;
        }

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
          console.log('Cart is empty or invalid, clearing cart items');
          setCartItems([]);
          setLoading(false);
          return;
        }

        console.log('Processing cart items:', cart);

        // Process each cart item individually
        const processedItems = [];
        const unavailableItems = [];

        // Process items in parallel for better performance
        const processPromises = cart.map(async (cartItem) => {
          try {
            console.log('Processing cart item:', cartItem);
            
            // Validate cart item structure
            if (!cartItem || typeof cartItem !== 'object' || !cartItem.id) {
              console.warn('Invalid cart item structure:', cartItem);
              return null;
            }

            // If we already have all the necessary data in the cart item, use it
            if (cartItem.title && typeof cartItem.price === 'number' && cartItem.image) {
              const processedItem = {
                ...cartItem,
                subtotal: cartItem.quantity * cartItem.price
              };
              console.log('Using existing cart item data:', processedItem);
              return processedItem;
            }

            // Otherwise, fetch the game data from Firestore
            const gameRef = doc(db, 'games', cartItem.id);
            const gameDoc = await getDoc(gameRef);

            if (!gameDoc.exists()) {
              console.log('Game not found in database:', cartItem.id);
              unavailableItems.push(cartItem.id);
              return null;
            }

            const gameData = gameDoc.data();
            console.log('Fetched game data:', gameData);
            
            if (!gameData.available) {
              console.log('Game is not available:', cartItem.id);
              unavailableItems.push(cartItem.id);
              return null;
            }

            const processedItem = {
              ...cartItem,
              ...gameData,
              subtotal: cartItem.quantity * gameData.price
            };
            console.log('Processed item:', processedItem);
            return processedItem;
          } catch (error) {
            console.error(`Error processing game ${cartItem.id}:`, error);
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
            unavailableItems.push(cartItem.id);
            return null;
          }
        });

        // Wait for all items to be processed
        const results = await Promise.all(processPromises);
        
        // Filter out null results and add valid items
        const validItems = results.filter(item => item !== null);
        processedItems.push(...validItems);

        // Remove unavailable items from cart
        if (unavailableItems.length > 0) {
          console.log('Removing unavailable items:', unavailableItems);
          unavailableItems.forEach(itemId => removeFromCart(itemId));
          setError('Some items were removed as they are no longer available.');
        }

        if (processedItems.length === 0) {
          console.log('No valid items in cart');
          setError('No valid items in cart');
        } else {
          console.log('Setting cart items:', processedItems);
          setCartItems(processedItems);
        }
      } catch (err) {
        console.error('Error in fetchCartItems:', err);
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        setError('Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cart, currentUser, removeFromCart]);

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) return;

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        platform: item.platform
      })),
      total,
      itemCount
    };

    navigate('/order-summary', { state: checkoutData });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.container}
      >
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <h2 style={styles.loadingTitle}>Loading cart...</h2>
        </div>
      </motion.div>
    );
  }

  if (error || cartError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.container}
      >
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>{error || cartError}</h2>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.container}
      >
        <h1 style={styles.title}>YOUR CART</h1>
        <div style={styles.emptyCartContainer}>
          <h2 style={styles.emptyCartTitle}>Your cart is empty</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/explore')}
            style={styles.browseButton}
          >
            Browse Games
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.container}
    >
      <h1 style={styles.title}>YOUR CART</h1>
      
      <div style={styles.cartContainer}>
        {/* Cart Items */}
        <div style={styles.itemsContainer}>
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={styles.cartItem}
              >
                <img
                  src={getImage(item.image)}
                  alt={item.title}
                  style={styles.itemImage}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = getImage('default');
                  }}
                />
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                  <p style={styles.itemPlatform}>Platform: {item.platform}</p>
                </div>
                <div style={styles.quantityContainer}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={styles.quantityButton}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </motion.button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    +
                  </motion.button>
                </div>
                <div style={styles.priceContainer}>
                  <p style={styles.subtotal}>${item.subtotal.toFixed(2)}</p>
                  <p style={styles.pricePerItem}>${item.price.toFixed(2)} each</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  Remove
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.summaryContainer}
        >
          <h2 style={styles.summaryTitle}>Cart Summary</h2>
          <div style={styles.summaryRow}>
            <span>Total Items:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Total Amount:</span>
            <span style={styles.totalPrice}>${total.toFixed(2)}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckout}
            style={styles.checkoutButton}
          >
            {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => clearCart()}
            style={styles.clearCartButton}
          >
            Clear Cart
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Impact2', sans-serif",
  },
  title: {
    textAlign: 'center',
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    fontFamily: "'Impact2', sans-serif",
  },
  cartContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '30px',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
    padding: '20px',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  itemImage: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '1.4rem',
    marginBottom: '10px',
    color: '#ffffff',
    textTransform: 'uppercase',
    fontFamily: "'Impact2', sans-serif",
  },
  itemPlatform: {
    fontSize: '1rem',
    color: '#ffffff',
    marginBottom: '15px',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quantityButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #ffffff',
    width: '30px',
    height: '30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  quantity: {
    fontSize: '1.2rem',
    color: '#ffffff',
    minWidth: '30px',
    textAlign: 'center',
  },
  priceContainer: {
    textAlign: 'right',
    minWidth: '120px',
  },
  subtotal: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '5px',
  },
  pricePerItem: {
    fontSize: '0.9rem',
    color: '#ffffff',
    opacity: 0.8,
  },
  removeButton: {
    backgroundColor: 'transparent',
    color: '#ff4444',
    border: '1px solid #ff4444',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  summaryContainer: {
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
    padding: '20px',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  },
  summaryTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#ffffff',
    textTransform: 'uppercase',
    fontFamily: "'Impact2', sans-serif",
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '1rem',
    color: '#ffffff',
  },
  totalPrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  checkoutButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '15px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '20px',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Impact2', sans-serif",
  },
  emptyCartContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  emptyCartTitle: {
    fontSize: '1.5rem',
    color: '#ffffff',
    marginBottom: '20px',
  },
  browseButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Impact2', sans-serif",
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #ffffff',
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontSize: '1.5rem',
    color: '#ffffff',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#ff4444',
    marginBottom: '20px',
  },
  retryButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Impact2', sans-serif",
  },
  clearCartButton: {
    backgroundColor: 'transparent',
    color: '#ff4444',
    border: '2px solid #ff4444',
    padding: '15px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Impact2', sans-serif",
  },
};

export default Cart; 