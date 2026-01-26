# Deployment Guide - GitHub Pages

This guide will help you deploy your Training Tracker application to GitHub Pages securely.

## Project Structure

The project is now organized into separate files for better maintainability and security:

```
Fitness-Tracker/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── app.js                  # Application logic
├── firebase-config.js      # Your Firebase credentials (gitignored)
├── firebase-config.example.js  # Template for Firebase config
├── .gitignore             # Prevents sensitive files from being committed
├── FIREBASE_SETUP.md      # Firebase setup instructions
└── DEPLOYMENT.md          # This file
```

## Security Configuration

### Important Files

- **firebase-config.js** - Contains your actual Firebase credentials. This file is gitignored and NEVER committed to GitHub.
- **firebase-config.example.js** - Template file that IS committed, showing the structure without real credentials.

### .gitignore Protection

The `.gitignore` file ensures `firebase-config.js` is never accidentally committed:

```gitignore
# Firebase Configuration
firebase-config.js
```

## Deployment Options

### Option 1: GitHub Pages with Environment Configuration (Recommended)

This method uses GitHub Secrets or a separate config file that you manually upload.

#### Step 1: Set Up Firebase Configuration

1. Follow `FIREBASE_SETUP.md` to create your Firebase project
2. Copy your Firebase configuration values
3. Update `firebase-config.js` locally with your credentials
4. **DO NOT commit this file** - it's already gitignored

#### Step 2: Deploy to GitHub Pages

1. **Push your code** (firebase-config.js will be automatically excluded):
   ```bash
   git add .
   git commit -m "Deploy training tracker"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Click "Save"

3. **Manually add Firebase config to GitHub Pages**:

   **Method A: Use GitHub Actions (Advanced)**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Create Firebase Config
           run: |
             cat > firebase-config.js <<'EOF'
             const firebaseConfig = {
                 apiKey: "${{ secrets.FIREBASE_API_KEY }}",
                 authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
                 projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
                 storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
                 messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
                 appId: "${{ secrets.FIREBASE_APP_ID }}"
             };
             EOF
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./
   ```

   Then add your Firebase credentials as GitHub Secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Add each Firebase config value as a separate secret:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`

   **Method B: Manual File Upload (Simpler)**
   After deploying, manually add firebase-config.js through GitHub web interface:
   - Go to your repository
   - Click "Add file" → "Create new file"
   - Name it `firebase-config.js`
   - Paste your Firebase configuration
   - Commit directly to `gh-pages` branch (if using GitHub Actions) or `main` branch

#### Step 3: Configure Firebase for Your Domain

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your GitHub Pages domain: `<username>.github.io`
3. If using a custom domain, add that too

#### Step 4: Update Firestore Security Rules

Since your credentials are now public (on GitHub Pages), ensure proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own data
    match /users/{userId}/data/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Option 2: Deploy with Firebase Hosting (Most Secure)

Firebase Hosting keeps your credentials more secure and integrates seamlessly:

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Initialize Firebase Hosting

```bash
firebase login
firebase init hosting
```

Select:
- Your Firebase project
- Public directory: `.` (current directory)
- Single-page app: No
- Overwrite index.html: No

#### Step 3: Deploy

```bash
firebase deploy --only hosting
```

Your app will be available at: `https://<your-project-id>.web.app`

### Option 3: Local Development Only

If you want to keep your app completely private:

1. Don't push to a public repository
2. Run locally by opening `index.html` in a browser
3. Or use a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

## Post-Deployment Checklist

- [ ] Firebase Authorized Domains configured
- [ ] Firestore Security Rules updated
- [ ] Anonymous authentication enabled in Firebase
- [ ] Application loads without errors
- [ ] Sign-in functionality works
- [ ] Workouts can be saved and retrieved
- [ ] No Firebase credentials visible in public repository

## Updating the Application

### For GitHub Pages Deployment

1. Make your code changes
2. Test locally
3. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. GitHub Pages will automatically update (may take 1-2 minutes)

### For Firebase Hosting

1. Make your code changes
2. Test locally
3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Troubleshooting

### "Firebase configuration error"
- Check that `firebase-config.js` exists and has correct values
- Verify the file is being loaded (check Network tab in browser DevTools)

### "Permission denied" errors in Firestore
- Review your security rules
- Ensure user is signed in (check auth state)
- Verify authorized domains in Firebase Console

### Changes not appearing on GitHub Pages
- Wait 1-2 minutes for propagation
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check that changes were actually pushed to the correct branch

### Firebase Config not found on GitHub Pages
- If using GitHub Actions, verify secrets are set correctly
- If manual upload, ensure file was added to the correct branch
- Check browser console for 404 errors

## Security Best Practices

1. **Never commit `firebase-config.js`** to public repositories
2. **Always use Firestore security rules** to protect user data
3. **Limit Firebase API key restrictions** in Google Cloud Console:
   - Go to Google Cloud Console → Credentials
   - Find your Firebase API key
   - Add HTTP referrer restrictions (your GitHub Pages URL)
4. **Enable App Check** in Firebase for additional security
5. **Monitor Firebase usage** to detect unusual activity

## Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS with your domain provider:
   - Add A records pointing to GitHub's IP addresses
   - Or add a CNAME record pointing to `<username>.github.io`
3. Add your custom domain to Firebase authorized domains
4. Update Firebase API key restrictions

## Cost Monitoring

Monitor your Firebase usage to stay within free tier:

- Firebase Console → Usage tab
- Set up budget alerts in Google Cloud Console
- Monitor unusual spikes in authentication or Firestore usage

Your personal training tracker should easily stay within Firebase's generous free tier.
