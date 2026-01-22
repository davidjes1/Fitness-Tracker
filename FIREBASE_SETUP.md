# Firebase Setup Guide

This guide will help you configure Firebase for the Training Tracker application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Register Your Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "Training Tracker")
3. You don't need to set up Firebase Hosting unless you want to
4. Click "Register app"

## Step 3: Get Your Firebase Configuration

After registering your app, Firebase will show you a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Update index.html

1. Open `index.html` in your editor
2. Find the `firebaseConfig` object (around line 681)
3. Replace the placeholder values with your actual Firebase configuration values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",              // Replace with your apiKey
    authDomain: "YOUR_AUTH_DOMAIN",      // Replace with your authDomain
    projectId: "YOUR_PROJECT_ID",        // Replace with your projectId
    storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your storageBucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messagingSenderId
    appId: "YOUR_APP_ID"                 // Replace with your appId
};
```

## Step 5: Enable Firestore Database

1. In the Firebase Console, go to "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" for development (you can set up security rules later)
4. Select a Cloud Firestore location (choose the one closest to your users)
5. Click "Enable"

## Step 6: Enable Authentication

1. In the Firebase Console, go to "Authentication" in the left menu
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Anonymous" sign-in by clicking on it and toggling it on
5. (Optional) Enable other sign-in methods like Email/Password or Google if desired

## Step 7: Set Up Firestore Security Rules (Optional but Recommended)

For production, update your Firestore security rules to protect user data:

1. Go to "Firestore Database" → "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/data/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow anonymous users to access their own data
    match /users/anonymous/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## Step 8: Test Your Application

1. Open `index.html` in a web browser
2. Click "Sign In Anonymously"
3. Try logging a workout
4. Check the Firebase Console → Firestore Database to see your data

## Data Structure

The app stores data in Firestore with the following structure:

```
users/
  {userId}/
    data/
      workouts: { value: [...workout objects...] }
      weights: { value: [...weight objects...] }
```

## Troubleshooting

### "Firebase not initialized" error
- Check that your Firebase configuration values are correct
- Make sure you've enabled Firestore and Authentication in the Firebase Console
- Check the browser console for more detailed error messages

### Data not saving
- Verify that you're signed in (check for "Anonymous User" in the header)
- Check Firestore security rules to ensure they allow writes
- Check the browser console for permission errors

### Anonymous user data lost
- Anonymous authentication creates a temporary user session
- If you clear browser data or the session expires, the anonymous user ID changes
- For persistent data across sessions, implement email/password authentication

## Next Steps

- **Add Email Authentication**: Enable email/password sign-in for persistent accounts
- **Add Google Sign-In**: Enable Google authentication for easy login
- **Export/Import Data**: Add functionality to backup and restore workout data
- **Multi-device Sync**: Your data is now synced across all devices where you sign in with the same account

## Cost Considerations

Firebase has a generous free tier:
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- **Authentication**: Unlimited for phone auth, email/password, and anonymous

For a personal training tracker, you'll likely stay well within the free tier limits.
