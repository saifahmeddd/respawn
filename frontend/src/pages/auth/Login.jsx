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

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

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
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue your gaming journey</p>

        <button
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
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f28',
    padding: '20px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '40px',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: '1rem',
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
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: '#ff6b81',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    '&:hover': {
      backgroundColor: '#ff4757',
      transform: 'translateY(-2px)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  registerText: {
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.9rem',
  },
  link: {
    color: '#ff6b81',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  googleButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd',
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
      backgroundColor: '#f5f5f5',
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
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
  dividerText: {
    color: '#a0a0a0',
    padding: '0 10px',
    fontSize: '0.9rem',
  },
};

export default Login; 