import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { getImage } from '../utils/imageMapping';

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

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "games", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Product not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    console.log('Adding product to cart:', product);
    const gameData = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      platform: product.platform,
      quantity: 1
    };
    addToCart(gameData);
  };

  if (loading) {
    return <div style={styles.loading}>Loading product details...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!product) {
    return <div style={styles.error}>Product not found</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>
      
      <div style={styles.productContainer}>
        <div style={styles.imageContainer}>
          <img 
            src={getImage(product.image)} 
            alt={product.title} 
            style={styles.image}
            onError={(e) => {
              e.target.src = getImage('default');
            }}
          />
        </div>
        
        <div style={styles.detailsContainer}>
          <h1 style={styles.title}>{product.title}</h1>
          <p style={styles.price}>${product.price}</p>
          <p style={styles.description}>
            {product.description || "Experience an immersive gaming adventure with stunning graphics and engaging gameplay. This title offers hours of entertainment with its rich storyline and dynamic gameplay mechanics. Perfect for both casual and hardcore gamers alike."}
          </p>
          
          <div style={styles.featuresContainer}>
            <h2 style={styles.featuresTitle}>Key Features:</h2>
            <ul style={styles.featuresList}>
              {product.features?.map((feature, index) => (
                <li key={index} style={styles.featureItem}>{feature}</li>
              )) || (
                <>
                  <li style={styles.featureItem}>Stunning 4K Graphics</li>
                  <li style={styles.featureItem}>Immersive Gameplay</li>
                  <li style={styles.featureItem}>Rich Storyline</li>
                  <li style={styles.featureItem}>Multiplayer Support</li>
                </>
              )}
            </ul>
          </div>
          
          <button onClick={handleAddToCart} style={styles.addToCartButton}>
            {currentUser ? 'Add to Cart' : 'Login to Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    marginTop: '50px',
    color: '#ffffff',
  },
  error: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#ff4444',
    marginTop: '50px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '10px',
    '&:hover': {
      color: '#ccc',
    },
  },
  productContainer: {
    display: 'flex',
    gap: '40px',
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    padding: '30px',
    color: '#fff',
  },
  imageContainer: {
    flex: '1',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
  },
  detailsContainer: {
    flex: '1',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#fff',
  },
  price: {
    fontSize: '24px',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '30px',
    color: '#ccc',
  },
  featuresContainer: {
    marginBottom: '30px',
  },
  featuresTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#fff',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
  },
  featureItem: {
    marginBottom: '10px',
    paddingLeft: '20px',
    position: 'relative',
    color: '#ccc',
    '&:before': {
      content: '"•"',
      position: 'absolute',
      left: 0,
      color: '#4CAF50',
    },
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
};

export default ProductDetails; 