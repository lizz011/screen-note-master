# OCR Subtitle Recognition Browser Extension

A Chrome extension that allows users to capture screenshots of subtitle areas in videos and recognize the text using OCR technology.

## Current Version (0.1)

This initial version focuses on implementing feature 5.1 (Screenshot Capture) from the PRD:
- Capturing subtitle areas via keyboard shortcut (Ctrl+Shift+S)
- Storing and reusing selected regions
- Preview of captured screenshots in the popup

## Installation Instructions

1. Clone or download this repository to your local machine
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click the "Load unpacked" button
5. Select the `public` folder from this repository
6. The extension should now be installed and visible in your browser toolbar

## Usage Instructions

1. Navigate to a webpage containing a video with subtitles
2. Press `Ctrl+Shift+S` or click the extension icon and then the "Capture Subtitle" button
3. First time use: Select the subtitle area by clicking and dragging to create a rectangular selection
4. Subsequent uses: The extension will automatically capture the previously selected region
5. View the captured screenshot in the extension popup
6. Use the "Reset Region" button if you need to select a different region

## Testing

A comprehensive test procedure is available in the `TestProcedure.md` file. It contains test cases to verify all aspects of the Screenshot Capture feature.

## Technical Details

- The extension is built using vanilla JavaScript
- Region selection and capture is implemented via DOM manipulation
- User preferences (region coordinates) are stored in Chrome's local storage
- Keyboard shortcut is registered through the Chrome commands API

## Development Plan

This initial version (V0.1) only implements feature 5.1 from the PRD. Future releases will include:
- Feature 5.2: OCR Text Recognition using tesseract.js
- Feature 5.3: Enhanced popup interface with Tailwind CSS and shadcn/ui

## Known Limitations

- The current implementation uses a placeholder for the actual screenshot capture. A production version would use the Chrome API for more accurate screen capture.
- Custom icons are currently placeholder files. These would be replaced with actual icons in a production version.
- The extension currently works best on desktop Chrome. Other browsers may have limited compatibility.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
