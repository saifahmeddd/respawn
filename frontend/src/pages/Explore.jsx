import React, { useEffect, useState } from "react";
import { db } from "../firebase/config.js";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getImage } from "../utils/imageMapping";

// Import CSS to register the font
import "../assets/fonts/fontStyles.css";

const Explore = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        const gamesSnapshot = await getDocs(gamesRef);
        const gamesData = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesData);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const goToCart = () => {
    navigate('/cart');
  };

  const handleAddToCart = (e, game) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login', { state: { from: '/explore' } });
      return;
    }
    console.log('Adding game to cart:', game);
    const gameData = {
      id: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
      platform: game.platform,
      quantity: 1
    };
    addToCart(gameData);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2 style={styles.loadingTitle}>Loading games...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>{error}</h2>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
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
          <div 
            key={game.id} 
            className="game-card" 
            style={styles.card}
            onClick={() => navigate(`/product/${game.id}`)}
          >
            <img
              src={getImage(game.image)}
              alt={game.title}
              style={styles.cardImage}
              onError={(e) => {
                e.target.src = getImage('default');
              }}
            />
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>{game.title}</h2>
              <p style={styles.cardDescription}>{game.description}</p>
              <p style={styles.cardGenre}>{game.genre}</p>
              <p style={styles.cardPrice}>${game.price}</p>
              <button
                onClick={(e) => handleAddToCart(e, game)}
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
    backgroundColor: '#1a1a1a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Impact2', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    fontFamily: "'Impact2', sans-serif",
  },
  cartButton: {
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
    fontFamily: "'Impact2', sans-serif",
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    padding: '20px 0',
  },
  card: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxWidth: '100%',
  },
  cardImage: {
    width: '100%',
    height: '300px',
    objectFit: 'contain',
    objectPosition: 'center',
    transition: 'transform 0.3s ease',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    backgroundColor: '#000',
    padding: '10px',
  },
  cardContent: {
    padding: '20px',
  },
  cardTitle: {
    fontSize: '1.4rem',
    marginBottom: '10px',
    color: '#ffffff',
    textTransform: 'uppercase',
    fontFamily: "'Impact2', sans-serif",
  },
  cardDescription: {
    fontSize: '0.9rem',
    color: '#cccccc',
    marginBottom: '15px',
    lineHeight: '1.4',
  },
  cardGenre: {
    fontSize: '0.8rem',
    color: '#888888',
    marginBottom: '10px',
  },
  cardPrice: {
    fontSize: '1.2rem',
    color: '#4CAF50',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Impact2', sans-serif",
    width: '100%',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  loadingTitle: {
    fontSize: '1.5rem',
    color: '#ffffff',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#ff4444',
    marginBottom: '20px',
  },
  retryButton: {
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
    fontFamily: "'Impact2', sans-serif",
  },
};

export default Explore;
