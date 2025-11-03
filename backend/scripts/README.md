# Populate Accounts Script

This script creates multiple user accounts in Firebase Authentication and Firestore.

## Setup

### 1. Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/project/fitu-466a8/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file

### 2. Configure the Service Account Key

Choose **ONE** of these options:

#### Option A: Add to `.env` file (Recommended)

1. Open the downloaded JSON file
2. Copy the entire JSON content
3. Add to `backend/.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"fitu-466a8",...}'
   ```
   (Make sure to use single quotes and keep it as one line, or escape properly)

#### Option B: Save as file in backend folder

1. Copy the JSON file to `backend/serviceAccountKey.json`
2. Make sure `.gitignore` includes `serviceAccountKey.json` (don't commit this!)

#### Option C: Set path in `.env`

1. Save the JSON file anywhere
2. Add to `backend/.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

## Usage

### Run with predefined users:
```bash
cd backend
node scripts/populateAccounts.js
```

### Generate random users:
Edit `populateAccounts.js` and change:
```javascript
const usersToCreate = generateRandomUsers(20); // Generate 20 random users
```

## What it creates:

- **Firebase Authentication**: User accounts with email/password
- **Firestore Documents**: User profiles in `users` collection with:
  - Full name, email, photo URL
  - Profile data (gender, age, height, weight)
  - Goals (dailyGoal, workoutFrequency, etc.)
  - Preferences (aiSuggestionsEnabled, remindersEnabled, etc.)
  - Timestamps

## Default Password

All accounts are created with password: `DemoPass123!`

## Notes

- The script will skip emails that already exist
- There's a 500ms delay between creations to avoid rate limiting
- Check the summary output for success/failure counts


