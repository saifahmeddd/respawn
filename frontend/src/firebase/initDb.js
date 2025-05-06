import { initializeDatabase } from './setupDatabase.js';
import { db } from './config.js';
import { collection, getDocs, enableIndexedDbPersistence } from 'firebase/firestore';

// Function to check existing collections
const checkCollections = async () => {
  try {
    const collections = ['games', 'users', 'orders', 'payments', 'inventory'];
    console.log('\nChecking existing collections:');
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        console.log(`${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.error(`Error checking ${collectionName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking collections:', error);
  }
};

// Enable offline persistence
const enablePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
  } catch (error) {
    console.error('Error enabling persistence:', error);
  }
};

// Run the initialization
console.log('Starting database initialization...');
console.log('Firebase configuration:', {
  projectId: db.app.options.projectId,
  databaseId: db.app.options.databaseId
});

enablePersistence()
  .then(() => checkCollections())
  .then(() => {
    console.log('\nInitializing database...');
    return initializeDatabase();
  })
  .then(() => {
    console.log('\nChecking collections after initialization:');
    return checkCollections();
  })
  .then(() => {
    console.log('\nDatabase initialization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nError during database initialization:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }); 