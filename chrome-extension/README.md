# Brain Rot Blocker Chrome Extension

This Chrome extension helps you manage your YouTube usage by requiring you to spend "brain coins" to watch videos. Each minute of YouTube costs 100 brain coins!

## Features

- 🧠 Blurs entire YouTube pages until you pay brain coins
- 💰 Charges 100 brain coins per minute of watch time
- ⏱️ Tracks your daily YouTube usage
- 📊 Shows stats on coins spent and time watched
- 🚫 Blocks YouTube when you run out of coins
- 🔄 Syncs with the Brain Rot Blocker web application

## Installation Instructions

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the chrome-extension folder
5. The Brain Rot Blocker extension should now be installed!

## How to Use

1. Visit YouTube.com and the page will be blurred with a payment prompt
2. Click "Pay 100 coins" to watch for 1 minute
3. After 1 minute, you'll need to pay again to continue watching
4. If you run out of coins, click "Go to Study App" to earn more
5. Use the extension popup to sync your balance with the web app

## Integration with Brain Rot Blocker Web App

This extension now fully integrates with the Brain Rot Blocker web application:

- Synchronizes brain coin balance between extension and web app
- Uses the same Flask API endpoints for coin management
- Direct links to the study app when you need more coins
- Fallback to local storage if the web app is unavailable
- Easy manual sync button in the extension popup

## API Integration

The extension connects to these Flask backend API endpoints:
- `/get_coins` - Retrieves your current balance
- `/add_coins` - Adds coins when you study
- `/remove_coins` - Removes coins when watching YouTube

## Technical Notes

The extension uses:
- Chrome Storage API as a fallback when offline
- Content scripts to blur and modify YouTube pages
- Background script for API integration and state management
- Offline mode that automatically activates if the API is unavailable

Remember, the goal is not to completely stop using YouTube, but to make you more mindful of your usage and encourage productive activities!