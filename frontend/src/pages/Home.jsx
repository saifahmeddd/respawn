import React, { useRef, useEffect } from "react";
import gta6Video from "../assets/gta6.mp4";
import customFont from "../assets/fonts/impact2.ttf";
import { useNavigate } from "react-router-dom";

// Add font-face declaration
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @font-face {
    font-family: 'Impact2';
    src: url(${customFont}) format('truetype');
    font-display: swap;
  }
`;
document.head.appendChild(fontStyle);

const Home = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 2.5;
    }
  }, []);

  return (
    <div>
      <div style={styles.heroSection}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={styles.videoBackground}
        >
          <source src={gta6Video} type="video/mp4" />
        </video>
        <div style={styles.overlay}></div>
        <div style={styles.overlayContent}>
          <h1 style={styles.onboardingText}>Dive into the ultimate gaming universe.</h1>
          <p style={styles.subText}>Discover, play, and experience the best titles.</p>
          <button
            style={styles.exploreButton}
            onClick={() => navigate("/explore")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.background = "linear-gradient(135deg, #ff4757, #c23616)";
              e.target.style.boxShadow = "0 12px 28px rgba(255, 71, 87, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "linear-gradient(135deg, #ff6b81, #e84118)";
              e.target.style.boxShadow = "0 4px 14px rgba(255, 107, 129, 0.3)";
            }}
          >
            Explore <span style={styles.arrowIcon}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  heroSection: {
    height: "100vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0",
    margin: "0",
    overflow: "hidden",
    fontFamily: 'Poppins, Roboto, Segoe UI, Arial, sans-serif',
  },
  videoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 15, 40, 0.7)",
    zIndex: 1,
  },
  overlayContent: {
    maxWidth: "700px",
    padding: "20px",
    fontFamily: 'Poppins, Roboto, Segoe UI, Arial, sans-serif',
    position: "relative",
    zIndex: 2,
  },
  onboardingText: {
    fontSize: "3.2rem",
    fontWeight: "bold",
    marginBottom: "10px",
    fontFamily: "Impact2, sans-serif",
    color: "#fff",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },
  subText: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#fff",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  },
  exploreButton: {
    background: "linear-gradient(135deg, #ff6b81, #e84118)",
    color: "#fff",
    border: "none",
    padding: "14px 36px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    boxShadow: "0 4px 14px rgba(255, 107, 129, 0.3)",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px"
  },
  arrowIcon: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  }
};

export default Home;
