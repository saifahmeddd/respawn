import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
import Explore from "./pages/Explore"; // Import Explore page
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import OrderSummary from "./pages/OrderSummary"; // Add OrderSummary import
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { auth } from "./firebase/config";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';

// Profile Dropdown Component
const ProfileDropdown = ({ user, onClose }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div style={styles.dropdown}>
      <div style={styles.dropdownHeader}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user.displayName || user.email}</div>
          <div style={styles.userEmail}>{user.email}</div>
        </div>
      </div>
      <div style={styles.dropdownContent}>
        <Link to="/profile" style={styles.dropdownItem} onClick={onClose}>
          <i className="fas fa-user-circle" style={styles.dropdownIcon}></i>
          Profile
        </Link>
        <button onClick={handleLogout} style={styles.dropdownItem}>
          <i className="fas fa-sign-out-alt" style={styles.dropdownIcon}></i>
          Logout
        </button>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const { currentUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarLeft}>
        <div style={styles.navLogo}>respawn</div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/explore" style={styles.navLink}>Explore</Link>
          <Link to="/about" style={styles.navLink}>About</Link>
          <Link to="/contact" style={styles.navLink}>Contact</Link>
        </div>
      </div>
      <div style={styles.navbarRight}>
        <div style={styles.navIcon}>
          <Link to="/cart" style={styles.navLink}>
            <i className="fas fa-shopping-cart" style={styles.icon}></i>
          </Link>
        </div>
        <div style={styles.navIcon}>
          {currentUser ? (
            <div style={styles.profileContainer}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={styles.profileButton}
              >
                <i className="fas fa-user-circle" style={styles.icon}></i>
              </button>
              {showProfile && (
                <ProfileDropdown
                  user={currentUser}
                  onClose={() => setShowProfile(false)}
                />
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.navLink}>
              <i className="fas fa-user" style={styles.icon}></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          
          <Navbar />

          {/* Main Content */}
          <main style={styles.contentContainer}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} /> {/* Add Explore route */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/order-summary" element={<OrderSummary />} /> {/* Add OrderSummary route */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              {/* Add other routes here as you build more pages */}
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#121212", // Extremely dark grey
    color: "white",
    padding: "0 20px",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    boxSizing: "border-box", // Ensure padding doesn't add to the width
  },
  navbarLeft: {
    display: "flex",
    alignItems: "center",
  },
  navbarRight: {
    display: "flex",
    alignItems: "center",
  },
  navLogo: {
    fontSize: "22px",
    fontWeight: "bold",
    marginRight: "30px",
    fontFamily: "'ArcadeFont', sans-serif", // Use the custom font
    textTransform: "uppercase", // Optional: Make the text uppercase
    color: "#fff", // Ensure the color contrasts well
  },
  navLinks: {
    display: "flex",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    margin: "0 15px",
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "'Google Sans', sans-serif", // Use Google Sans Bold
  },
  navIcon: {
    margin: "0 10px",
    cursor: "pointer",
  },
  icon: {
    fontSize: "18px",
  },
  contentContainer: {
    width: "100%",
    flex: "1 1 auto",
    boxSizing: "border-box", // Ensure padding doesn't add to the width
  },
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    color: "white",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: "0",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    minWidth: "200px",
    marginTop: "10px",
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: "15px",
    borderBottom: "1px solid #333",
  },
  userInfo: {
    color: "white",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "4px",
  },
  userEmail: {
    fontSize: "14px",
    color: "#888",
  },
  dropdownContent: {
    padding: "8px 0",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    cursor: "pointer",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    ":hover": {
      backgroundColor: "#333",
    },
  },
  dropdownIcon: {
    marginRight: "10px",
    width: "16px",
  },
};

export default App;