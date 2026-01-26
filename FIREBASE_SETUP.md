# Firebase Setup Guide

This guide will help you configure Firebase for the Training Tracker application.

## Project Structure

The application is now organized into separate files for better security and maintainability:

- `index.html` - Main HTML structure
- `styles.css` - All styling
- `app.js` - Application logic
- `firebase-config.js` - Your Firebase credentials (gitignored, never committed)
- `firebase-config.example.js` - Template showing configuration structure

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

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your editor (this file is already created and gitignored)
2. Replace the placeholder values with your actual Firebase configuration values:

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

**Important:** This file is listed in `.gitignore` and will NOT be committed to GitHub, keeping your credentials safe.

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

### Local Testing

1. Open `index.html` in a web browser (or use a local server for better compatibility)
   ```bash
   # Option 1: Simple local server with Python
   python -m http.server 8000

   # Option 2: Simple local server with Node.js
   npx serve .
   ```
2. Navigate to `http://localhost:8000` (or the URL shown)
3. Click "Sign In Anonymously"
4. Try logging a workout
5. Check the Firebase Console → Firestore Database to see your data

### File Loading

The application loads files in this order:
1. `index.html` - Loads `styles.css` and Firebase SDKs
2. `firebase-config.js` - Your credentials (must be present locally)
3. `app.js` - All application logic

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
- Check that your Firebase configuration values are correct in `firebase-config.js`
- Ensure `firebase-config.js` exists in the project root directory
- Make sure you've enabled Firestore and Authentication in the Firebase Console
- Check the browser console for more detailed error messages
- If testing locally, use a local web server instead of opening the HTML file directly

### "firebase-config.js not found" (404 error)
- Verify that `firebase-config.js` exists in your project root
- If deploying to GitHub Pages, see `DEPLOYMENT.md` for secure deployment strategies
- Check the browser's Network tab to see if the file is being requested correctly

### Data not saving
- Verify that you're signed in (check for "Anonymous User" in the header)
- Check Firestore security rules to ensure they allow writes
- Check the browser console for permission errors

### Anonymous user data lost
- Anonymous authentication creates a temporary user session
- If you clear browser data or the session expires, the anonymous user ID changes
- For persistent data across sessions, implement email/password authentication

## Benefits of Separated File Structure

### Security
- **Credentials Protected**: `firebase-config.js` is gitignored, never committed to version control
- **Safe Sharing**: You can share your code publicly without exposing credentials
- **Easy Updates**: Update credentials without touching your main codebase

### Maintainability
- **Organized Code**: Separate files for HTML, CSS, and JavaScript
- **Easier Debugging**: Find and fix issues faster with organized code
- **Collaboration Ready**: Other developers can easily understand the project structure

### Deployment
- **GitHub Pages Compatible**: Deploy safely with multiple credential strategies
- **Firebase Hosting Ready**: Direct deployment to Firebase infrastructure
- **Version Control Friendly**: Clean git history without credential changes

## Next Steps

- **Deploy Your App**: See `DEPLOYMENT.md` for GitHub Pages or Firebase Hosting deployment
- **Add Email Authentication**: Enable email/password sign-in for persistent accounts
- **Add Google Sign-In**: Enable Google authentication for easy login
- **Export/Import Data**: Add functionality to backup and restore workout data
- **Multi-device Sync**: Your data is now synced across all devices where you sign in with the same account

## Cost Considerations

Firebase has a generous free tier:
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- **Authentication**: Unlimited for phone auth, email/password, and anonymous

For a personal training tracker, you'll likely stay well within the free tier limits.
