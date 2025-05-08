import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Check if Firebase auth is properly initialized
    console.log('Auth object:', auth);
    if (!auth) {
      console.error('Firebase auth is not initialized');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        username: result.user.displayName || result.user.email.split('@')[0],
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user',
        authProvider: 'google'
      });

      toast.success('Google Sign-in successful!');
      navigate('/');
    } catch (error) {
      console.error('Google Sign-in error:', error);
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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Starting registration process...');
      console.log('Auth object before registration:', auth);

      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }

      // Create user with email and password
      console.log('Creating user with email and password...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('User created successfully:', userCredential);

      // Update profile with username
      console.log('Updating user profile...');
      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });
      console.log('Profile updated successfully');

      // Create user document in Firestore
      console.log('Creating user document in Firestore...');
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username: formData.username,
        email: formData.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user',
        authProvider: 'email'
      });
      console.log('User document created successfully');

      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Registration error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'An error occurred during registration';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
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
          Create Account
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={styles.subtitle}
        >
          Join our gaming community today
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
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleFocus('username')}
              onBlur={handleBlur}
              required
              style={{
                ...styles.input,
                borderColor: focusedField === 'username' ? '#ff6b81' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: focusedField === 'username' ? '0 0 0 2px rgba(255, 107, 129, 0.2)' : 'none'
              }}
              placeholder="Choose a username"
            />
            {errors.username && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorMessage}
              >
                {errors.username}
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
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
            {errors.email && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorMessage}
              >
                {errors.email}
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
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
              placeholder="Create a password"
            />
            {errors.password && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorMessage}
              >
                {errors.password}
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={styles.inputGroup}
          >
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={handleBlur}
              required
              style={{
                ...styles.input,
                borderColor: focusedField === 'confirmPassword' ? '#ff6b81' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: focusedField === 'confirmPassword' ? '0 0 0 2px rgba(255, 107, 129, 0.2)' : 'none'
              }}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorMessage}
              >
                {errors.confirmPassword}
              </motion.span>
            )}
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
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
              'Create Account'
            )}
          </motion.button>
        </form>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={styles.loginText}
        >
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in
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
  loginText: {
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
  errorMessage: {
    color: '#ff4757',
    fontSize: '0.9rem',
    marginTop: '5px',
    marginLeft: '4px',
  },
};

export default Register; 