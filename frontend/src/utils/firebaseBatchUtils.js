import { db } from "./firebase/config"; // Assuming your Firebase config is here
import { collection, writeBatch, doc, setDoc } from "firebase/firestore";

const insertGamesInBatch = async (gamesData) => {
  const batch = writeBatch(db);
  const gamesCollection = collection(db, "games");

  gamesData.forEach((game) => {
    // Create a new document reference. If you want Firestore to auto-generate IDs,
    // you don't need to provide an ID here. If you have specific IDs, you can use
    // doc(gamesCollection, game.id) where game.id is the desired document ID.
    const newDocRef = doc(gamesCollection);

    // Set the data for the new document
    batch.set(newDocRef, game);
  });

  try {
    await batch.commit();
    console.log("Successfully inserted all games in a batch!");
  } catch (error) {
    console.error("Error inserting games in batch:", error);
  }
};

// Example usage:
const newGamesToInsert = [
  {
    title: "Cyber Nexus",
    genre: "Action RPG",
    price: 59.99,
    imageUrl: "url-to-cyber-nexus-image",
    isNew: true,
    // ... other fields
  },
  {
    title: "Starlight Drifter",
    genre: "Space Adventure",
    price: 49.99,
    imageUrl: "url-to-starlight-drifter-image",
    // ... other fields
  },
  // ... more game objects
];

// Call the function to insert the games
insertGamesInBatch(newGamesToInsert);

// If you have specific document IDs you want to use:
import { doc } from "firebase/firestore";

const insertGamesWithCustomIds = async (gamesData) => {
  const batch = writeBatch(db);
  const gamesCollection = collection(db, "games");

  gamesData.forEach((game) => {
    const docRef = doc(gamesCollection, game.id); // Use the 'id' field from your game data
    batch.set(docRef, {
      title: game.title,
      genre: game.genre,
      price: game.price,
      imageUrl: game.imageUrl,
      isNew: game.isNew,
      // ... other fields (excluding the 'id' field if you're using it as the doc ID)
    });
  });

  try {
    await batch.commit();
    console.log("Successfully inserted games with custom IDs in a batch!");
  } catch (error) {
    console.error("Error inserting games with custom IDs in batch:", error);
  }
};

const gamesWithIds = [
  {
    id: "cyber-nexus-001",
    title: "Cyber Nexus",
    genre: "Action RPG",
    price: 59.99,
    imageUrl: "url-to-cyber-nexus-image",
    isNew: true,
  },
  {
    id: "starlight-drifter-002",
    title: "Starlight Drifter",
    genre: "Space Adventure",
    price: 49.99,
    imageUrl: "url-to-starlight-drifter-image",
  },
  // ... more game objects with 'id' fields
];

// Call this function if your game data has specific IDs
// insertGamesWithCustomIds(gamesWithIds);

const addGameWithImage = async (gameData) => {
  try {
    const gamesCollection = collection(db, "games");
    const newGameRef = doc(gamesCollection);
    
    // Add the game data to Firestore
    await setDoc(newGameRef, {
      name: gameData.name,
      genre: gameData.genre,
      price: gameData.price,
      platform: gameData.platform,
      image: gameData.image, // Just the filename, e.g. "overwatch.jpg"
      createdAt: new Date()
    });
    
    console.log("Game added successfully with ID:", newGameRef.id);
    return newGameRef.id;
  } catch (error) {
    console.error("Error adding game:", error);
    throw error;
  }
};

// Example usage:
const newGame = {
  name: "Overwatch 2",
  genre: "FPS",
  price: 39.99,
  platform: "PC",
  image: "overwatch.jpg" // Make sure this image exists in your assets/images folder
};

// Call the function to add the game
addGameWithImage(newGame);