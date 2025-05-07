import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

  const { orderId, paymentId, amount } = location.state;

  return (
    <div style={styles.container}>
      <div style={styles.successContainer}>
        <div style={styles.iconContainer}>
          <svg
            style={styles.checkmark}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              style={styles.checkmarkCircle}
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              style={styles.checkmarkCheck}
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.message}>
          Thank you for your purchase. Your order has been confirmed and the items have been removed from inventory.
        </p>

        <div style={styles.detailsContainer}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Order ID:</span>
            <span style={styles.detailValue}>{orderId}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment ID:</span>
            <span style={styles.detailValue}>{paymentId}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Amount Paid:</span>
            <span style={styles.detailValue}>${amount.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={() => navigate('/orders')}
            style={styles.button}
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/explore')}
            style={styles.button}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes stroke {
            100% {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes scale {
            0%, 100% {
              transform: none;
            }
            50% {
              transform: scale3d(1.1, 1.1, 1);
            }
          }
          
          @keyframes fill {
            100% {
              box-shadow: inset 0px 0px 0px 30px #4CAF50;
            }
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
  successContainer: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
    padding: '40px',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
    textAlign: 'center',
    animation: 'scale 0.3s ease-in-out 0.9s both',
  },
  iconContainer: {
    marginBottom: '30px',
  },
  checkmark: {
    width: '100px',
    height: '100px',
    margin: '0 auto',
  },
  checkmarkCircle: {
    stroke: '#4CAF50',
    strokeWidth: 2,
    strokeDasharray: 166,
    strokeDashoffset: 166,
    animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
  },
  checkmarkCheck: {
    stroke: '#4CAF50',
    strokeWidth: 2,
    strokeDasharray: 48,
    strokeDashoffset: 48,
    animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  message: {
    fontSize: '1.2rem',
    color: '#ffffff',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '30px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: '#ffffff',
    fontSize: '1rem',
  },
  detailValue: {
    color: '#4CAF50',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  button: {
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
    '&:hover': {
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
    },
  },
};

export default PaymentSuccess; 