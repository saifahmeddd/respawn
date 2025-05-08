import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImage } from '../utils/imageMapping';

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

// Cache for games data
let gamesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, calculateTotal, initialized } = useCart();
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the total calculation
  const total = useMemo(() => calculateTotal(), [cartItems]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for cart context to initialize
        if (!initialized) {
          return;
        }

        if (!cart || cart.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const gamesRef = collection(db, 'games');
        const gamesSnapshot = await getDocs(gamesRef);
        const games = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Create a map of games for faster lookup
        const gamesMap = new Map(games.map(game => [game.id, game]));

        // Combine cart items with game details
        const combinedItems = cart
          .map(cartItem => {
            const gameDetails = gamesMap.get(cartItem.id);
            if (!gameDetails) {
              console.warn(`Game details not found for cart item: ${cartItem.id}`);
              return null;
            }
            
            return {
              ...cartItem,
              ...gameDetails,
              subtotal: cartItem.quantity * gameDetails.price
            };
          })
          .filter(Boolean);

        if (combinedItems.length === 0) {
          setError('Some items in your cart are no longer available');
        } else {
          setCartItems(combinedItems);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cart, initialized]); // Add initialized to dependencies

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

  // Memoize the cart item rendering
  const renderCartItem = useCallback((item) => (
    <div key={item.id} style={styles.cartItem}>
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
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        >
          -
        </button>
        <span style={styles.quantity}>{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        >
          +
        </button>
      </div>
      <div style={styles.priceContainer}>
        <p style={styles.subtotal}>${item.subtotal.toFixed(2)}</p>
        <p style={styles.pricePerItem}>${item.price.toFixed(2)} each</p>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        style={styles.removeButton}
      >
        Remove
      </button>
    </div>
  ), [updateQuantity, removeFromCart]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2 style={styles.loadingTitle}>Loading cart...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>{error}</h2>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>YOUR CART</h1>
        <div style={styles.emptyCartContainer}>
          <h2 style={styles.emptyCartTitle}>Your cart is empty</h2>
          <button
            onClick={() => navigate('/explore')}
            style={styles.browseButton}
          >
            Browse Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>YOUR CART</h1>
      
      <div style={styles.cartContainer}>
        {/* Cart Items */}
        <div style={styles.itemsContainer}>
          {cartItems.map(renderCartItem)}
        </div>

        {/* Cart Summary */}
        <div style={styles.summaryContainer}>
          <h2 style={styles.summaryTitle}>Cart Summary</h2>
          <div style={styles.summaryRow}>
            <span>Total Items:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Total Amount:</span>
            <span style={styles.totalPrice}>${total.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            style={styles.checkoutButton}
          >
            {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>
        </div>
      </div>
    </div>
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
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
    padding: '20px',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
  },
  itemImage: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '5px',
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
};

export default Cart; 