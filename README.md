# YouTube Mini Browser

A Chrome extension that allows you to browse and watch YouTube videos in a floating overlay without leaving your current webpage.

![YouTube Mini Browser](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=300&width=600&query=youtube%20mini%20browser%20extension%20screenshot)

## Features

- Search for YouTube videos without leaving your current page
- Watch videos in a floating, draggable player
- Resize the video player to your preferred size
- Minimize the player when you need more screen space
- Category shortcuts for quick browsing (Music, Gaming, News, Sports)
- Customizable API key for YouTube Data API

## Installation

### From Source Code

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension folder
5. The YouTube Mini Browser extension should now appear in your extensions list

### Required Files

Make sure your extension folder contains these files:
- `manifest.json`
- `background.js`
- `content-script.js`
- `popup.html`
- `overlay.html`
- `icons/` folder with icon files (icon16.png, icon48.png, icon128.png, youtube.png, placeholder.png)

## Usage

### Opening the Mini Browser

1. Click the YouTube Mini Browser extension icon in your Chrome toolbar
2. A small YouTube icon will appear in the bottom-right corner of your current webpage
3. Click this icon to open the YouTube search dialog

### Searching for Videos

1. Enter a search term in the search box
2. Press Enter or click the "Search" button
3. Browse through the search results
4. Click on any video to play it in the overlay player

### Using Category Shortcuts

1. Open the YouTube search dialog
2. Click on any category button (Music, Gaming, News, Sports)
3. Browse through the category results

### Controlling the Video Player

1. **Move**: Click and drag the top bar of the video player
2. **Resize**: Click and drag the bottom-right corner of the player
3. **Minimize**: Click the "_" button to collapse the player
4. **Close**: Click the "×" button to close the player
5. **Expand**: When minimized, click the "□" button to expand the player

### Customizing the API Key

1. Click the extension icon in the Chrome toolbar with the right mouse button
2. Select "Options" from the context menu
3. Enter your YouTube Data API key in the input field
4. Click "Save"

## Troubleshooting

### Extension Not Loading

- Make sure all required files are present in the extension folder
- Check the browser console for any error messages
- Try reloading the extension from the `chrome://extensions/` page

### Videos Not Loading

- Verify your YouTube API key is valid and has the necessary permissions
- Check if you've exceeded your daily API quota
- Try searching for different videos

### Mini Icon Not Appearing

- Make sure you're on a webpage that allows content scripts (not chrome:// pages)
- Try clicking the extension icon again
- Reload the current webpage

## API Key Setup

This extension requires a YouTube Data API key to function properly. A default key is provided, but it has limited quota. To use your own key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create an API key
5. Enter this key in the extension options

## Privacy

This extension:
- Does not collect any personal data
- Only makes API requests to YouTube when you search for videos
- Stores your API key locally in your browser's storage
- Does not track your browsing history

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- YouTube Data API
- Chrome Extensions API
```

This README provides comprehensive information about how to install and use the YouTube Mini Browser extension. You can save this as `README.md` in the root directory of your extension project.

The README includes:
- An overview of the extension's features
- Detailed installation instructions
- Step-by-step usage guides for all features
- Troubleshooting tips
- API key setup instructions
- Privacy information
- License and contribution information

Feel free to customize any sections to better match your specific implementation or add screenshots of your actual extension in action.