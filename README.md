# Training Tracker

A modern, Firebase-powered fitness tracking application for managing strength training workouts and triathlon maintenance cardio sessions.

## Features

- **Strength Training Tracking**: Log exercises, sets, reps, and weights
- **Cardio Logging**: Track running, biking, swimming, and other cardio activities
- **Progress Visualization**: View stats, PRs, and weekly summaries
- **Weight Tracking**: Monitor body weight changes over time
- **Cloud Sync**: Firebase-powered data persistence across devices
- **Anonymous Authentication**: Start tracking immediately without account creation

## Project Structure

```
Fitness-Tracker/
├── index.html                  # Main HTML structure
├── styles.css                  # All CSS styling
├── app.js                      # Application logic
├── firebase-config.js          # Firebase credentials (gitignored - create locally)
├── firebase-config.example.js  # Template for Firebase configuration
├── .gitignore                  # Protects sensitive files
├── FIREBASE_SETUP.md          # Firebase configuration guide
├── DEPLOYMENT.md              # GitHub Pages deployment guide
└── README.md                  # This file
```

## Quick Start

### 1. Set Up Firebase

Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md):

1. Create a Firebase project
2. Enable Firestore and Anonymous Authentication
3. Copy your Firebase configuration
4. Update `firebase-config.js` with your credentials

### 2. Run Locally

**Option A: Open Directly**
```bash
# Simply open index.html in your web browser
open index.html  # macOS
start index.html # Windows
```

**Option B: Use a Local Server (Recommended)**
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000
```

### 3. Deploy (Optional)

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- GitHub Pages deployment
- Firebase Hosting deployment
- Security best practices

## Usage

1. **Sign In**: Click "Sign In Anonymously" to start
2. **Log Workout**:
   - Choose "Strength Training" or "Cardio"
   - Fill in workout details
   - Click "Save Workout"
3. **View Progress**:
   - Check the "Stats" tab for overview
   - View "History" for past workouts
   - Track "Progress" for PRs and weight changes

## Security

- **Firebase credentials** are stored in `firebase-config.js` which is **gitignored**
- Never commit `firebase-config.js` to version control
- Use `firebase-config.example.js` as a template
- See [DEPLOYMENT.md](DEPLOYMENT.md) for secure deployment strategies

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Hosting**: GitHub Pages compatible

## File Descriptions

- **index.html**: Main application structure and HTML markup
- **styles.css**: All styling including responsive design
- **app.js**: Core application logic, Firebase integration, UI rendering
- **firebase-config.js**: Your Firebase project credentials (not committed)
- **firebase-config.example.js**: Template showing config structure

## Development

### Making Changes

1. Edit HTML in `index.html`
2. Edit styles in `styles.css`
3. Edit logic in `app.js`
4. Test locally
5. Commit and push (credentials stay safe in gitignored file)

### Adding Features

The codebase is organized into logical sections:
- **Storage** wrapper for Firebase operations
- **Auth** functions for authentication
- **Render** functions for UI updates
- **Event** listeners for user interactions

## Future Enhancements

- Email/password authentication
- Google Sign-In integration
- Data export/import functionality
- Charts and graphs for progress visualization
- Training phase management
- Customizable workout templates

## Troubleshooting

### Common Issues

**"Firebase not initialized"**
- Ensure `firebase-config.js` exists with valid credentials
- Check Firebase Console for enabled services

**"Permission denied" in Firestore**
- Verify security rules in Firebase Console
- Ensure user is signed in

**App not loading styles/scripts**
- Use a local web server instead of opening HTML directly
- Check browser console for errors
- Verify file paths in index.html

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for more troubleshooting help.

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss potential changes.

## License

MIT License - feel free to use and modify for your own training needs.

## Support

For setup help:
1. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. Check [DEPLOYMENT.md](DEPLOYMENT.md)
3. Review browser console for errors
4. Verify Firebase Console settings

---

**Start tracking your training today!** 💪
