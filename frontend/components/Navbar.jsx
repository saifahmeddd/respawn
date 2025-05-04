import React, { useEffect, useState } from "react";
import { db } from "/Users/saifahmed/Desktop/respawn/frontend/src/firebase/config.js";
import { collection, getDocs } from "firebase/firestore";

const Home = () => {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [newGames, setNewGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCol = collection(db, "games");
        const snapshot = await getDocs(gamesCol);
        const gameList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (gameList.length > 0) {
          // Assuming the first game is the featured one
          setFeaturedGame(gameList[0]);
          // Assuming the next few are "new" games
          setNewGames(gameList.slice(1, 4)); // Adjust the slice as needed
        }

        setLoading(false);
      } catch (e) {
        console.error("Error fetching games:", e);
        setError("Failed to load games.");
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading games...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!featuredGame) {
    return <div>No featured game available.</div>;
  }

  return (
    <div style={styles.homeContainer}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Level Up Your Game Collection</h1>
          <p style={styles.heroSubtitle}>
            Discover the newest and most exciting games for all platforms.
            Pre-order, buy, and download instantly.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.shopNowButton}>
              Shop Now <span style={styles.arrow}>→</span>
            </button>
            <button style={styles.watchTrailerButton}>
              <span style={styles.playIcon}>▶</span> Watch Trailer
            </button>
          </div>
        </div>
        <div style={styles.heroFeaturedGame}>
          {featuredGame.imageUrl && (
            <div style={styles.featuredGameImageContainer}>
              <img
                src={featuredGame.imageUrl}
                alt={featuredGame.title}
                style={styles.featuredGameImage}
              />
              {featuredGame.isNew && <div style={styles.newBadge}>New</div>}
            </div>
          )}
          <h3 style={styles.featuredGameTitle}>{featuredGame.title}</h3>
          <p style={styles.featuredGamePrice}>
            ${featuredGame.price !== undefined ? featuredGame.price : "N/A"}
          </p>
        </div>
      </section>

      {/* New Games Section */}
      {newGames.length > 0 && (
        <section style={styles.newGamesSection}>
          <h2 style={styles.newGamesHeading}>New Releases</h2>
          <div style={styles.newGamesGrid}>
            {newGames.map((game) => (
              <div key={game.id} style={styles.newGameCard}>
                {game.imageUrl && (
                  <div style={styles.newGameImageContainer}>
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      style={styles.newGameImage}
                    />
                    {game.isNew && <div style={styles.newBadgeSmall}>New</div>}
                  </div>
                )}
                <h3 style={styles.newGameTitle}>{game.title}</h3>
                <p style={styles.newGamePrice}>
                  ${game.price !== undefined ? game.price : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const styles = {
  homeContainer: {
    fontFamily: "sans-serif",
    backgroundColor: "#181818",
    color: "#fff",
    padding: "40px",
  },
  heroSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    alignItems: "center",
    marginBottom: "60px",
  },
  heroContent: {
    paddingRight: "40px",
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#f0f0f0",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#ccc",
    marginBottom: "30px",
  },
  heroButtons: {
    display: "flex",
    gap: "20px",
  },
  shopNowButton: {
    backgroundColor: "#e91e63",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "15px 30px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  arrow: {
    fontSize: "1.2rem",
  },
  watchTrailerButton: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "5px",
    padding: "15px 30px",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  playIcon: {
    fontSize: "1.2rem",
  },
  heroFeaturedGame: {
    textAlign: "center",
  },
  featuredGameImageContainer: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "15px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  featuredGameImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  featuredGameTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#eee",
  },
  featuredGamePrice: {
    fontSize: "1.5rem",
    color: "#e91e63",
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#ff4081",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "5px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  newGamesSection: {
    marginTop: "80px",
  },
  newGamesHeading: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#f0f0f0",
    textAlign: "center",
  },
  newGamesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  newGameCard: {
    backgroundColor: "#282828",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
  },
  newGameImageContainer: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "15px",
  },
  newGameImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  newGameTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#ddd",
  },
  newGamePrice: {
    color: "#e91e63",
    fontWeight: "bold",
  },
  newBadgeSmall: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "#ff4081",
    color: "#fff",
    padding: "3px 6px",
    borderRadius: "3px",
    fontSize: "0.7rem",
    fontWeight: "bold",
  },
  loading: {
    fontSize: "1.5rem",
    color: "#ccc",
    textAlign: "center",
    marginTop: "50px",
  },
  error: {
    fontSize: "1.5rem",
    color: "#ff6666",
    textAlign: "center",
    marginTop: "50px",
  },
};

export default Home;