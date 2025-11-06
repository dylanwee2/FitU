import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Initialize Firebase Admin
let app;
try {
  // Option 1: Use service account key from .env (as JSON string)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount)
    });
  }
  // Option 2: Use service account key file path
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    app = initializeApp({
      credential: cert(serviceAccount.default || serviceAccount)
    });
  }
  // Option 3: Try to import from a local file
  else {
    try {
      const serviceAccount = await import('../serviceAccountKey.json');
      app = initializeApp({
        credential: cert(serviceAccount.default || serviceAccount)
      });
    } catch (err) {
      throw new Error('No Firebase service account key found. See setup instructions below.');
    }
  }
} catch (error) {
  console.error('\n❌ ERROR: Firebase Admin initialization failed\n');
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_KEY or serviceAccountKey.json\n');
  console.log('📋 SETUP INSTRUCTIONS:');
  console.log('1. Go to: https://console.firebase.google.com/project/fitu-466a8/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the JSON file');
  console.log('4. Choose ONE of these options:');
  console.log('   Option A: Add to .env file:');
  console.log('      FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account","project_id":"fitu-466a8",...}\'');
  console.log('   Option B: Save as serviceAccountKey.json in backend/ folder');
  console.log('   Option C: Set path in .env:');
  console.log('      FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json\n');
  process.exit(1);
}

const auth = getAuth();
const db = getFirestore();

// Sample user data - matching your signup structure exactly
const sampleUsers = [
  { 
    name: 'John Chen', 
    email: 'john.chen@university.edu', 
    password: 'DemoPass123!',
    gender: 'male',
    age: 20,
    height: 175,
    weight: 70,
    dailyGoal: 2500,
    workoutFrequency: 4
  },
  { 
    name: 'Sarah Kim', 
    email: 'sarah.kim@university.edu', 
    password: 'DemoPass123!',
    gender: 'female',
    age: 19,
    height: 165,
    weight: 58,
    dailyGoal: 2000,
    workoutFrequency: 3
  },
  { 
    name: 'Mike Johnson', 
    email: 'mike.johnson@university.edu', 
    password: 'DemoPass123!',
    gender: 'male',
    age: 21,
    height: 180,
    weight: 75,
    dailyGoal: 2800,
    workoutFrequency: 5
  },
  { 
    name: 'Emily Davis', 
    email: 'emily.davis@university.edu', 
    password: 'DemoPass123!',
    gender: 'female',
    age: 20,
    height: 168,
    weight: 62,
    dailyGoal: 2200,
    workoutFrequency: 3
  },
  { 
    name: 'David Wilson', 
    email: 'david.wilson@university.edu', 
    password: 'DemoPass123!',
    gender: 'male',
    age: 22,
    height: 178,
    weight: 72,
    dailyGoal: 2600,
    workoutFrequency: 4
  },
];

// Generate random users if needed
function generateRandomUsers(count = 10) {
  const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'James', 'Emma', 'Chris', 'Jessica', 'Alex', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Sam', 'Riley', 'Quinn', 'Avery', 'Dakota'];
  const lastNames = ['Chen', 'Kim', 'Johnson', 'Davis', 'Wilson', 'Anderson', 'Brown', 'Martinez', 'Taylor', 'White', 'Smith', 'Garcia', 'Miller', 'Jones', 'Williams', 'Lee', 'Wang', 'Zhang', 'Patel', 'Singh'];
  const domains = ['university.edu', 'student.edu', 'college.edu'];
  const genders = ['male', 'female', ''];

  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@${domain}`;
    
    users.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: 'DemoPass123!',
      gender: genders[Math.floor(Math.random() * genders.length)],
      age: Math.floor(Math.random() * 6) + 18, // 18-23
      height: Math.floor(Math.random() * 30) + 160, // 160-190
      weight: Math.floor(Math.random() * 30) + 55, // 55-85
      dailyGoal: Math.floor(Math.random() * 1000) + 2000, // 2000-3000
      workoutFrequency: Math.floor(Math.random() * 4) + 2 // 2-5
    });
  }
  return users;
}

// Create a single user
async function createUser(userData) {
  try {
    // Create auth user
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      emailVerified: false,
    });

    console.log(`✓ Created auth user: ${userData.email} (UID: ${userRecord.uid})`);

    // Create Firestore document - matching your exact signup structure
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      fullName: userData.name,
      email: userData.email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=e63946&color=fff`,
      
      // Profile fields
      gender: userData.gender || '',
      age: userData.age || null,
      height: userData.height || null,
      weight: userData.weight || null,
      
      // Goals
      goalType: userData.goalType || '',
      dailyGoal: userData.dailyGoal || 2000,
      dietaryPreference: userData.dietaryPreference || '',
      allergies: userData.allergies || '',
      workoutFrequency: userData.workoutFrequency || 3,
      
      // Default preferences
      spotifyConnected: false,
      aiSuggestionsEnabled: true,
      remindersEnabled: true,
      darkMode: false,
      
      // Timestamps
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log(`✓ Created Firestore document for: ${userData.email}`);
    return { success: true, uid: userRecord.uid, email: userData.email };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠ Email already exists: ${userData.email}`);
      return { success: false, error: 'email-exists', email: userData.email };
    } else {
      console.error(`✗ Error creating ${userData.email}:`, error.message);
      return { success: false, error: error.message, email: userData.email };
    }
  }
}

// Main function
async function populateAccounts() {
  console.log('🚀 Starting account population...\n');
  console.log('Project: fitu-466a8\n');

  // Choose which users to create:
  const usersToCreate = sampleUsers; // Use predefined users
  // const usersToCreate = generateRandomUsers(20); // Or generate random ones

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const user of usersToCreate) {
    const result = await createUser(user);
    if (result.success) {
      results.success.push(result);
    } else if (result.error === 'email-exists') {
      results.skipped.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${results.success.length}`);
  console.log(`⚠ Skipped (already exists): ${results.skipped.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  
  if (results.success.length > 0) {
    console.log('\n✅ Created accounts:');
    results.success.forEach(r => console.log(`   - ${r.email} (${r.uid})`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed accounts:');
    results.failed.forEach(r => console.log(`   - ${r.email}: ${r.error}`));
  }

  process.exit(0);
}

// Run the script
populateAccounts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


