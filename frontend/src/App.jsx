import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Explore from "./pages/Explore"; // Import Explore page
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import OrderSummary from "./pages/OrderSummary"; // Add OrderSummary import
import { CartProvider } from "./context/CartContext";
import React from "react";

function App() {
  return (
    <CartProvider>
      <Router>
        {/* Navigation Bar */}
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
              <i className="fas fa-user" style={styles.icon}></i>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={styles.contentContainer}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} /> {/* Add Explore route */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/order-summary" element={<OrderSummary />} /> {/* Add OrderSummary route */}
            {/* Add other routes here as you build more pages */}
          </Routes>
        </main>
      </Router>
    </CartProvider>
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
};

export default App;