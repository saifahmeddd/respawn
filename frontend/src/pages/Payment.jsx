import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location.state?.orderDetails) {
      navigate('/cart');
      return;
    }
    console.log('Received order details:', location.state.orderDetails);
    setOrderDetails(location.state.orderDetails);
  }, [location.state, navigate]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: '',
      email: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'credit') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.name) {
        setError('Please fill in all payment details');
        return false;
      }
      // Basic card number validation (16 digits)
      if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
        setError('Invalid card number');
        return false;
      }
      // Basic expiry date validation (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
        setError('Invalid expiry date (MM/YY)');
        return false;
      }
      // Basic CVV validation (3-4 digits)
      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        setError('Invalid CVV');
        return false;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paymentDetails.email) {
        setError('Please enter your PayPal email');
        return false;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentDetails.email)) {
        setError('Invalid email address');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePaymentDetails()) {
      return;
    }

    if (!orderDetails || !orderDetails.id) {
      setError('Invalid order details. Please return to cart and try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting payment process with order details:', orderDetails);

      // Create payment record
      const paymentData = {
        orderId: orderDetails.id,
        userId: currentUser.uid,
        amount: orderDetails.total,
        paymentMethod,
        status: 'completed',
        createdAt: serverTimestamp(),
        paymentDetails: paymentMethod === 'credit' ? {
          cardNumber: `****${paymentDetails.cardNumber.slice(-4)}`,
          expiryDate: paymentDetails.expiryDate,
          name: paymentDetails.name
        } : {
          email: paymentDetails.email
        }
      };

      console.log('Creating payment record:', paymentData);
      const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
      console.log('Payment record created with ID:', paymentRef.id);

      // Update order status
      console.log('Updating order status for order:', orderDetails.id);
      const orderRef = doc(db, 'orders', orderDetails.id);
      await updateDoc(orderRef, {
        status: 'paid',
        paymentStatus: 'completed',
        paymentId: paymentRef.id,
        updatedAt: serverTimestamp()
      });
      console.log('Order status updated successfully');

      // Update inventory for each item in the order
      console.log('Fetching order data for inventory update');
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();
      console.log('Order data retrieved:', orderData);
      
      if (!orderData || !orderData.items) {
        throw new Error('Invalid order data structure');
      }

      // Get all inventory documents
      const inventoryCollection = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryCollection);
      const inventoryMap = new Map();
      
      inventorySnapshot.forEach(doc => {
        const data = doc.data();
        inventoryMap.set(data.gameId, { id: doc.id, data });
      });

      // Update inventory for each item
      for (const item of orderData.items) {
        if (!item.id || !item.quantity) {
          console.warn('Invalid item data:', item);
          continue;
        }

        console.log('Processing inventory update for item:', item);
        const inventoryItem = inventoryMap.get(item.id);
        
        if (inventoryItem) {
          const { id: inventoryId, data } = inventoryItem;
          const currentStock = data.stockQuantity;
          console.log(`Updating inventory for item ${item.id}: Current stock ${currentStock}, reducing by ${item.quantity}`);
          
          const inventoryRef = doc(db, 'inventory', inventoryId);
          await updateDoc(inventoryRef, {
            stockQuantity: currentStock - item.quantity,
            lastUpdated: serverTimestamp()
          });
          console.log('Inventory updated successfully');
        } else {
          console.warn(`Inventory document not found for game ${item.id}`);
        }
      }

      // Redirect to success page
      console.log('Payment process completed successfully, redirecting to success page');
      navigate('/payment-success', {
        state: {
          orderId: orderDetails.id,
          paymentId: paymentRef.id,
          amount: orderDetails.total
        }
      });
    } catch (err) {
      console.error('Payment error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
      });
      setError(`Failed to process payment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!orderDetails) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.paymentContainer}>
        <h1 style={styles.title}>Payment</h1>
        
        <div style={styles.orderSummary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.summaryRow}>
            <span>Total Amount:</span>
            <span style={styles.amount}>${orderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.paymentMethods}>
          <button
            style={{
              ...styles.methodButton,
              ...(paymentMethod === 'credit' && styles.methodButtonActive)
            }}
            onClick={() => handlePaymentMethodChange('credit')}
          >
            Credit Card
          </button>
          <button
            style={{
              ...styles.methodButton,
              ...(paymentMethod === 'paypal' && styles.methodButtonActive)
            }}
            onClick={() => handlePaymentMethodChange('paypal')}
          >
            PayPal
          </button>
        </div>

        <form onSubmit={handlePayment} style={styles.form}>
          {paymentMethod === 'credit' ? (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  style={styles.input}
                  maxLength="19"
                  className="payment-input"
                />
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    style={styles.input}
                    maxLength="5"
                    className="payment-input"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    style={styles.input}
                    maxLength="4"
                    className="payment-input"
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name on Card</label>
                <input
                  type="text"
                  name="name"
                  value={paymentDetails.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  style={styles.input}
                  className="payment-input"
                />
              </div>
            </>
          ) : (
            <div style={styles.inputGroup}>
              <label style={styles.label}>PayPal Email</label>
              <input
                type="email"
                name="email"
                value={paymentDetails.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                style={styles.input}
                className="payment-input"
              />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
            className="payment-submit-button"
          >
            {loading ? 'Processing...' : `Pay $${orderDetails.total.toFixed(2)}`}
          </button>
        </form>
      </div>

      <style>
        {`
          .payment-input:focus {
            outline: none;
            border-color: #4CAF50;
          }
          
          .payment-submit-button:hover:not(:disabled) {
            background-color: #45a049;
          }
          
          .payment-submit-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Impact2', sans-serif",
  },
  paymentContainer: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
    padding: '40px',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  orderSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '30px',
  },
  summaryTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#ffffff',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentMethods: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  methodButton: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  methodButtonActive: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#ffffff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '5px',
    padding: '12px',
    color: '#ffffff',
    fontSize: '1rem',
  },
  row: {
    display: 'flex',
    gap: '20px',
  },
  error: {
    color: '#ff4444',
    fontSize: '0.9rem',
    marginTop: '5px',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    padding: '15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
  },
};

export default Payment; 