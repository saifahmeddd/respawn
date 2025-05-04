import React, { useEffect, useState } from "react";
import { db } from "../firebase/config.js";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

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

// Import CSS to register the font
import "../assets/fonts/fontStyles.css";

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

const Explore = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCol = collection(db, "games");
        const snapshot = await getDocs(gamesCol);
        const gameList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGames(gameList);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching games:", e);
        setError("Failed to load games.");
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const goToCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return <div style={styles.loading}>Loading games...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Games</h1>
        <button onClick={goToCart} style={styles.cartButton}>
          Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
        </button>
      </div>
      <div style={styles.cardGrid}>
        {games.map((game) => (
          <div key={game.id} className="game-card" style={styles.card}>
            <img
              src={imageMap[game.image] || imageMap.default}
              alt={game.title}
              style={styles.cardImage}
              onError={(e) => {
                e.target.src = imageMap.default;
              }}
            />
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>{game.title}</h2>
              <p style={styles.cardDescription}>{game.description}</p>
              <p style={styles.cardGenre}>Genre: {game.genre}</p>
              <button
                onClick={() => addToCart(game)}
                style={styles.addToCartButton}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline hover effects */}
      <style>
        {`
          .game-card {
            background: rgba(26, 26, 26, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }

          .game-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 24px rgba(255, 255, 255, 0.2);
          }

          .game-card:hover img {
            transform: scale(1.05);
          }

          .game-card:hover .add-to-cart-button {
            background-color: #ffffff;
            color: #1a1a1a;
          }

          .cart-button:hover {
            background-color: #ffffff;
            color: #1a1a1a;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Impact2', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: "3px",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
    fontFamily: "'Impact2', sans-serif",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
    padding: "20px",
  },
  card: {
    position: "relative",
    borderRadius: "15px",
    transition: "all 0.3s ease",
  },
  cardImage: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  cardContent: {
    padding: "20px",
    background:
      "linear-gradient(to bottom, rgba(26, 26, 26, 0.8), rgba(26, 26, 26, 0.95))",
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#ffffff",
    textTransform: "uppercase",
    fontFamily: "'Impact2', sans-serif",
  },
  cardDescription: {
    fontSize: "0.9rem",
    marginBottom: "15px",
    color: "#ddd",
    lineHeight: "1.6",
  },
  cardGenre: {
    fontSize: "0.8rem",
    color: "#aaa",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  addToCartButton: {
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    width: "100%",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  cartButton: {
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
    padding: "12px 25px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.2rem",
    marginTop: "50px",
    color: "#ffffff",
  },
  error: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#ff4444",
    marginTop: "50px",
  },
};

export default Explore;
