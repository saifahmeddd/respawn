import { db } from "./config.js";
import { collection, addDoc, setDoc, doc, getDocs, query, where } from "firebase/firestore";

// Sample data for games
const games = [
  {
    title: "Cricket 24",
    description: "The ultimate cricket simulation game featuring Pakistan Super League teams",
    price: 49.99,
    genre: "Sports",
    platform: "PC, PS5, Xbox Series X",
    image: "cricket24.jpg",
    stock: 100
  },
  {
    title: "Karachi Streets",
    description: "An open-world action game set in the vibrant streets of Karachi",
    price: 39.99,
    genre: "Action",
    platform: "PC, PS5",
    image: "karachi.jpg",
    stock: 75
  },
  {
    title: "Lahore Legends",
    description: "A historical RPG set in Mughal-era Lahore",
    price: 59.99,
    genre: "RPG",
    platform: "PC, PS5, Xbox Series X",
    image: "lahore.jpg",
    stock: 50
  },
  {
    title: "Pakistani Truck Simulator",
    description: "Experience the colorful world of Pakistani truck art and long-haul driving",
    price: 29.99,
    genre: "Simulation",
    platform: "PC",
    image: "truck.jpg",
    stock: 150
  },
  {
    title: "Hunza Valley Adventure",
    description: "Explore the beautiful landscapes of Hunza Valley in this adventure game",
    price: 44.99,
    genre: "Adventure",
    platform: "PC, PS5, Xbox Series X",
    image: "hunza.jpg",
    stock: 60
  }
];

// Enhanced sample data for users
const users = [
  {
    username: "ahmed_khan",
    email: "ahmed.khan@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Gulshan-e-Iqbal, Karachi",
    phone: "+92 300 1234567",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["jazz_cash", "credit_card"]
  },
  {
    username: "sara_ali",
    email: "sara.ali@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "DHA Phase 6, Lahore",
    phone: "+92 301 2345678",
    city: "Lahore",
    province: "Punjab",
    paymentMethods: ["easy_paisa", "credit_card"]
  },
  {
    username: "admin_pak",
    email: "admin@respawn.pk",
    role: "admin",
    createdAt: new Date(),
    address: "Islamabad",
    phone: "+92 302 3456789",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    paymentMethods: ["bank_transfer"]
  },
  {
    username: "usman_raza",
    email: "usman.raza@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "F-8, Islamabad",
    phone: "+92 303 4567890",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    paymentMethods: ["jazz_cash"]
  },
  {
    username: "fatima_akhtar",
    email: "fatima.akhtar@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Gulberg III, Lahore",
    phone: "+92 304 5678901",
    city: "Lahore",
    province: "Punjab",
    paymentMethods: ["easy_paisa", "jazz_cash"]
  },
  {
    username: "hamza_siddiqui",
    email: "hamza.siddiqui@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Clifton, Karachi",
    phone: "+92 305 6789012",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["credit_card", "bank_transfer"]
  },
  {
    username: "zainab_qureshi",
    email: "zainab.qureshi@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Bahria Town, Rawalpindi",
    phone: "+92 306 7890123",
    city: "Rawalpindi",
    province: "Punjab",
    paymentMethods: ["jazz_cash", "easy_paisa"]
  },
  {
    username: "bilal_ahmed",
    email: "bilal.ahmed@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Defence Phase 5, Karachi",
    phone: "+92 307 8901234",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["credit_card"]
  },
  {
    username: "ayesha_malik",
    email: "ayesha.malik@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Model Town, Lahore",
    phone: "+92 308 9012345",
    city: "Lahore",
    province: "Punjab",
    paymentMethods: ["easy_paisa", "bank_transfer"]
  },
  {
    username: "omar_farooq",
    email: "omar.farooq@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Sector F-10, Islamabad",
    phone: "+92 309 0123456",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    paymentMethods: ["jazz_cash", "credit_card"]
  },
  {
    username: "hira_khan",
    email: "hira.khan@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Gulshan-e-Maymar, Karachi",
    phone: "+92 310 1234567",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["easy_paisa"]
  },
  {
    username: "talha_rizvi",
    email: "talha.rizvi@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Cantt, Lahore",
    phone: "+92 311 2345678",
    city: "Lahore",
    province: "Punjab",
    paymentMethods: ["credit_card", "jazz_cash"]
  },
  {
    username: "mehwish_ali",
    email: "mehwish.ali@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "Sector G-11, Islamabad",
    phone: "+92 312 3456789",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    paymentMethods: ["bank_transfer", "easy_paisa"]
  },
  {
    username: "saad_ahmed",
    email: "saad.ahmed@email.com",
    role: "customer",
    createdAt: new Date(),
    address: "North Nazimabad, Karachi",
    phone: "+92 313 4567890",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["jazz_cash", "credit_card"]
  },
  {
    username: "admin_support",
    email: "support@respawn.pk",
    role: "admin",
    createdAt: new Date(),
    address: "Head Office, Karachi",
    phone: "+92 314 5678901",
    city: "Karachi",
    province: "Sindh",
    paymentMethods: ["bank_transfer"]
  }
];

// Enhanced sample orders data
const orders = [
  {
    userId: "user1", // Will be replaced with actual user ID
    gameIds: ["game1", "game2"], // Will be replaced with actual game IDs
    totalAmount: 89.98,
    status: "completed",
    orderDate: new Date("2024-03-01"),
    shippingAddress: "Gulshan-e-Iqbal, Karachi",
    paymentMethod: "jazz_cash",
    deliveryStatus: "delivered",
    trackingNumber: "PK123456789",
    estimatedDelivery: new Date("2024-03-03")
  },
  {
    userId: "user2",
    gameIds: ["game3"],
    totalAmount: 59.99,
    status: "pending",
    orderDate: new Date("2024-03-15"),
    shippingAddress: "DHA Phase 6, Lahore",
    paymentMethod: "easy_paisa",
    deliveryStatus: "processing",
    trackingNumber: "PK987654321",
    estimatedDelivery: new Date("2024-03-17")
  },
  {
    userId: "user3",
    gameIds: ["game1", "game4"],
    totalAmount: 79.98,
    status: "completed",
    orderDate: new Date("2024-03-10"),
    shippingAddress: "F-8, Islamabad",
    paymentMethod: "credit_card",
    deliveryStatus: "delivered",
    trackingNumber: "PK456789123",
    estimatedDelivery: new Date("2024-03-12")
  },
  {
    userId: "user4",
    gameIds: ["game5"],
    totalAmount: 44.99,
    status: "processing",
    orderDate: new Date("2024-03-20"),
    shippingAddress: "Gulberg III, Lahore",
    paymentMethod: "jazz_cash",
    deliveryStatus: "shipped",
    trackingNumber: "PK789123456",
    estimatedDelivery: new Date("2024-03-22")
  }
];

// Helper function to safely add a document
const safeAddDoc = async (collectionRef, data) => {
  try {
    const docRef = await addDoc(collectionRef, data);
    console.log(`Successfully added document with ID: ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error('Error adding document:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      data: data
    });
    throw error;
  }
};

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    console.log('Firebase configuration:', {
      projectId: db.app.options.projectId,
      databaseId: db.app.options.databaseId
    });

    // Check if games collection exists and has data
    const gamesCollection = collection(db, "games");
    console.log('Checking games collection...');
    const gamesSnapshot = await getDocs(gamesCollection);
    
    if (gamesSnapshot.empty) {
      console.log('Adding games...');
      for (const game of games) {
        await safeAddDoc(gamesCollection, game);
      }
      console.log("Games added successfully");
    } else {
      console.log(`Games collection exists with ${gamesSnapshot.size} documents`);
    }

    // Add users - Force update
    console.log('\nSetting up users collection...');
    const usersCollection = collection(db, "users");
    
    // Delete existing users
    console.log('Clearing existing users...');
    const existingUsers = await getDocs(usersCollection);
    const deletePromises = existingUsers.docs.map(doc => 
      setDoc(doc.ref, { _deleted: true })
    );
    await Promise.all(deletePromises);
    
    // Add all users
    console.log(`Adding ${users.length} users...`);
    let addedCount = 0;
    for (const user of users) {
      try {
        await safeAddDoc(usersCollection, {
          ...user,
          createdAt: new Date(),
          _deleted: false
        });
        addedCount++;
        console.log(`Added user ${addedCount}/${users.length}: ${user.username}`);
      } catch (error) {
        console.error(`Error adding user ${user.username}:`, error);
      }
    }
    console.log(`Users added successfully: ${addedCount} out of ${users.length}`);

    // Create and populate orders collection
    console.log('\nSetting up orders collection...');
    const ordersCollection = collection(db, "orders");
    const ordersSnapshot = await getDocs(ordersCollection);
    
    if (ordersSnapshot.empty) {
      console.log('Getting user and game IDs...');
      const usersData = await getDocs(usersCollection);
      const gamesData = await getDocs(gamesCollection);
      
      if (usersData.empty || gamesData.empty) {
        throw new Error('Cannot create orders: Missing users or games data');
      }

      const userIds = usersData.docs.map(doc => doc.id);
      const gameIds = gamesData.docs.map(doc => doc.id);

      console.log('Adding orders...');
      for (const order of orders) {
        const newOrder = {
          ...order,
          userId: userIds[Math.floor(Math.random() * userIds.length)],
          gameIds: [gameIds[Math.floor(Math.random() * gameIds.length)]]
        };
        await safeAddDoc(ordersCollection, newOrder);
      }
      console.log("Orders added successfully");
    } else {
      console.log(`Orders collection exists with ${ordersSnapshot.size} documents`);
    }

    // Create payments collection
    console.log('\nSetting up payments collection...');
    const paymentsCollection = collection(db, "payments");
    const paymentsSnapshot = await getDocs(paymentsCollection);
    
    if (paymentsSnapshot.empty) {
      console.log('Getting orders for payments...');
      const ordersData = await getDocs(ordersCollection);
      
      if (ordersData.empty) {
        throw new Error('Cannot create payments: No orders found');
      }

      console.log('Adding payments...');
      for (const orderDoc of ordersData.docs) {
        const orderData = orderDoc.data();
        const payment = {
          orderId: orderDoc.id,
          paymentDate: orderData.orderDate,
          paymentStatus: orderData.status === "completed" ? "completed" : "pending",
          paymentMethod: orderData.paymentMethod,
          amount: orderData.totalAmount,
          transactionId: `TRX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentDetails: {
            bankName: orderData.paymentMethod === "bank_transfer" ? "HBL" : null,
            accountNumber: orderData.paymentMethod === "bank_transfer" ? "PK123456789" : null,
            mobileNumber: orderData.paymentMethod.includes("cash") ? "+92 3XX XXXXXXX" : null
          }
        };
        await safeAddDoc(paymentsCollection, payment);
      }
      console.log("Payments added successfully");
    } else {
      console.log(`Payments collection exists with ${paymentsSnapshot.size} documents`);
    }

    // Create inventory collection
    console.log('\nSetting up inventory collection...');
    const inventoryCollection = collection(db, "inventory");
    const inventorySnapshot = await getDocs(inventoryCollection);
    
    if (inventorySnapshot.empty) {
      console.log('Getting games for inventory...');
      const gamesData = await getDocs(gamesCollection);
      
      if (gamesData.empty) {
        throw new Error('Cannot create inventory: No games found');
      }

      console.log('Adding inventory items...');
      for (const gameDoc of gamesData.docs) {
        const gameData = gameDoc.data();
        await safeAddDoc(inventoryCollection, {
          gameId: gameDoc.id,
          stockQuantity: gameData.stock || 50,
          lastUpdated: new Date(),
          location: "Karachi Warehouse",
          reorderPoint: 20,
          supplier: "Pakistani Game Distributors",
          lastRestockDate: new Date("2024-03-01"),
          nextRestockDate: new Date("2024-04-01")
        });
      }
      console.log("Inventory added successfully");
    } else {
      console.log(`Inventory collection exists with ${inventorySnapshot.size} documents`);
    }

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    console.error("Error initializing database:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Function to create a new order
export const createOrder = async (userId, gameIds, totalAmount) => {
  try {
    const order = {
      userId,
      gameIds,
      totalAmount,
      status: "pending",
      orderDate: new Date(),
      deliveryStatus: "processing",
      trackingNumber: `PK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    };

    const orderRef = await safeAddDoc(collection(db, "orders"), order);
    
    // Create corresponding payment record
    const payment = {
      orderId: orderRef.id,
      paymentDate: new Date(),
      paymentStatus: "pending",
      paymentMethod: "credit_card",
      amount: totalAmount,
      transactionId: `TRX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paymentDetails: {
        bankName: null,
        accountNumber: null,
        mobileNumber: null
      }
    };

    await safeAddDoc(collection(db, "payments"), payment);
    
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Function to update inventory
export const updateInventory = async (gameId, quantity) => {
  try {
    const inventoryRef = doc(db, "inventory", gameId);
    await setDoc(inventoryRef, {
      stockQuantity: quantity,
      lastUpdated: new Date(),
      lastRestockDate: new Date()
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
}; 