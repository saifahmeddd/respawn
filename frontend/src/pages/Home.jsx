import React from "react";
import racingBg from "../assets/images/overwatch.jpg";
import customFont from "../assets/fonts/impact2.ttf";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={styles.heroSection}>
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

      <style>{fontFace}</style>
    </div>
  );
};

const styles = {
  heroSection: {
    height: "100vh",
    backgroundImage: `
      linear-gradient(rgba(15, 15, 40, 0.7), rgba(15, 15, 40, 0.7)), 
      url(${racingBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0",
    margin: "0",
    fontFamily: 'Poppins, Roboto, Segoe UI, Arial, sans-serif',
  },
  overlayContent: {
    maxWidth: "700px",
    padding: "20px",
    fontFamily: 'Poppins, Roboto, Segoe UI, Arial, sans-serif',
  },
  onboardingText: {
    fontSize: "3.2rem",
    fontWeight: "bold",
    marginBottom: "10px",
    fontFamily: "CustomFont, sans-serif",
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

const fontFace = `
  @font-face {
    font-family: 'CustomFont';
    src: url(${customFont}) format('truetype');
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = fontFace;
document.head.appendChild(styleSheet);

export default Home;
