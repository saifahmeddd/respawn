import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    console.log('OrderSummary mounted');
    console.log('Location state:', location.state);
    console.log('Location state type:', typeof location.state);
    console.log('Location state keys:', location.state ? Object.keys(location.state) : 'no state');

    // Validate and set order details
    if (!location.state) {
      console.error('No order details found in location state');
      setError('No order details found. Please return to cart and try again.');
      return;
    }

    const { items, total, itemCount } = location.state;
    console.log('Extracted data:', { items, total, itemCount });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid items data:', items);
      setError('Invalid order items. Please return to cart and try again.');
      return;
    }

    if (!total || total <= 0) {
      console.error('Invalid total:', total);
      setError('Invalid order total. Please return to cart and try again.');
      return;
    }

    if (!itemCount || itemCount <= 0) {
      console.error('Invalid item count:', itemCount);
      setError('Invalid item count. Please return to cart and try again.');
      return;
    }

    // Validate each item
    const validItems = items.every(item => {
      const isValid = item.id && item.title && item.price && item.quantity && item.subtotal;
      if (!isValid) {
        console.error('Invalid item:', item);
        console.error('Missing fields:', {
          id: !item.id,
          title: !item.title,
          price: !item.price,
          quantity: !item.quantity,
          subtotal: !item.subtotal
        });
      }
      return isValid;
    });

    if (!validItems) {
      setError('Invalid item data. Please return to cart and try again.');
      return;
    }

    console.log('Setting order details:', { items, total, itemCount });
    setOrderDetails({ items, total, itemCount });
  }, [location.state]);

  const handleConfirmOrder = async () => {
    if (!orderDetails) {
      setError('No order details available');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to place an order');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating order with details:', orderDetails);

      // Create order data
      const orderData = {
        items: orderDetails.items,
        total: orderDetails.total,
        itemCount: orderDetails.itemCount,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        paymentStatus: 'pending',
        shippingAddress: currentUser.shippingAddress || null,
        billingAddress: currentUser.billingAddress || null
      };

      console.log('Saving order to Firestore:', orderData);

      // Save order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      const orderId = orderRef.id;
      console.log('Order created with ID:', orderId);

      // Clear cart
      clearCart();
      console.log('Cart cleared');

      // Navigate to payment page with complete order details
      navigate('/payment', { 
        state: { 
          orderDetails: {
            ...orderData,
            id: orderId,
            total: orderDetails.total
          }
        } 
      });
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>{error}</h2>
          <button
            onClick={() => navigate('/cart')}
            style={styles.retryButton}
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2 style={styles.loadingTitle}>Loading order details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ORDER SUMMARY</h1>
      
      <div style={styles.orderContainer}>
        {/* Order Items */}
        <div style={styles.itemsContainer}>
          {orderDetails.items.map((item) => (
            <div key={item.id} style={styles.orderItem}>
              <img
                src={imageMap[item.image] || imageMap.default}
                alt={item.title}
                style={styles.itemImage}
                onError={(e) => {
                  e.target.src = imageMap.default;
                }}
              />
              <div style={styles.itemDetails}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemPlatform}>Platform: {item.platform}</p>
                <p style={styles.itemQuantity}>Quantity: {item.quantity}</p>
                <p style={styles.itemPrice}>${item.price.toFixed(2)} each</p>
              </div>
              <div style={styles.subtotalContainer}>
                <p style={styles.subtotal}>${item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={styles.summaryContainer}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.summaryRow}>
            <span>Total Items:</span>
            <span>{orderDetails.itemCount}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Total Amount:</span>
            <span style={styles.totalPrice}>${orderDetails.total.toFixed(2)}</span>
          </div>

          {/* Confirm Order Button */}
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            style={styles.confirmButton}
          >
            {loading ? 'Processing...' : 'Confirm Order'}
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
  orderContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  },
  orderItem: {
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
    marginBottom: '5px',
  },
  itemQuantity: {
    fontSize: '1rem',
    color: '#ffffff',
    marginBottom: '5px',
  },
  itemPrice: {
    fontSize: '1rem',
    color: '#4CAF50',
  },
  subtotalContainer: {
    textAlign: 'right',
    minWidth: '120px',
  },
  subtotal: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffffff',
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
  confirmButton: {
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

export default OrderSummary; 