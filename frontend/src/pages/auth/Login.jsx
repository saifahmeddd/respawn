import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Check if Firebase auth is properly initialized
    console.log('Checking Firebase initialization...');
    console.log('Auth object:', auth);
    if (!auth) {
      console.error('Firebase auth is not initialized');
    } else {
      console.log('Firebase auth is initialized');
    }

    // Add auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User is signed in' : 'No user');
      if (user) {
        console.log('Current user:', user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google Sign-in process...');
      
      const provider = new GoogleAuthProvider();
      console.log('Google provider created');
      
      console.log('Attempting to sign in with popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful, user:', result.user);
      
      // Update last login time in Firestore
      console.log('Updating last login time in Firestore...');
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp()
      });
      console.log('Firestore update successful');

      toast.success('Google Sign-in successful!');
      navigate('/');
    } catch (error) {
      console.error('Google Sign-in error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Don't show error toast for user-cancelled popup
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      if (userCredential.user) {
        // Update last login time in Firestore
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: serverTimestamp()
        });

        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.container}
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={styles.formContainer}
      >
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={styles.title}
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={styles.subtitle}
        >
          Sign in to continue your gaming journey
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={styles.googleButton}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            style={styles.googleIcon} 
          />
          Continue with Google
        </motion.button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={styles.inputGroup}
          >
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              required
              style={{
                ...styles.input,
                borderColor: focusedField === 'email' ? '#ff6b81' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(255, 107, 129, 0.2)' : 'none'
              }}
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={styles.inputGroup}
          >
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              required
              style={{
                ...styles.input,
                borderColor: focusedField === 'password' ? '#ff6b81' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(255, 107, 129, 0.2)' : 'none'
              }}
              placeholder="Enter your password"
            />
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={styles.loadingSpinner}
              />
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={styles.registerText}
        >
          Don't have an account?{' '}
          <Link to="/login" style={styles.link}>
            Create one now
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: '20px',
    backgroundImage: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    padding: '40px',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: '#fff',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    background: 'linear-gradient(45deg, #ff6b81, #ff4757)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#888',
    fontSize: '1.1rem',
    marginBottom: '30px',
    textAlign: 'center',
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
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginLeft: '4px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#fff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    '&:focus': {
      borderColor: '#ff6b81',
      boxShadow: '0 0 0 2px rgba(255, 107, 129, 0.2)',
    },
  },
  button: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(45deg, #ff6b81, #ff4757)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(255, 107, 129, 0.3)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    margin: '0 auto',
  },
  registerText: {
    color: '#888',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.9rem',
  },
  link: {
    color: '#ff6b81',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#ff4757',
      textDecoration: 'underline',
    },
  },
  googleButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#242424',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    '&::before, &::after': {
      content: '""',
      flex: 1,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
  },
  dividerText: {
    color: '#888',
    padding: '0 10px',
    fontSize: '0.9rem',
  },
};

export default Login; 