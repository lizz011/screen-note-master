# NoteShot Browser Extension v2

This is the updated version of the NoteShot browser extension that captures screenshots and sends them to the NoteShot web application.

## Key Changes in v2

1. **Improved Tab Management**
   - The extension now properly detects if the web app is already open in a tab
   - Instead of opening a new tab each time, it reuses the existing one
   - Avoids adding URL parameters that cause page reloads

2. **Better User Experience**
   - Tab focus management is improved to always bring the web app to focus
   - Screenshots are highlighted when newly added
   - Better error handling and user feedback

3. **Technical Improvements**
   - More reliable localStorage synchronization between extension and web app
   - Better event handling for real-time updates
   - Improved error handling

## Installation

1. Open Chrome Extensions page (`chrome://extensions/`)
2. Enable "Developer Mode"
3. Click "Load unpacked"
4. Select the `browser-extension-v2` folder

## Usage

1. Click the NoteShot extension icon or press `Ctrl+Shift+S` to capture a screenshot
2. The screenshot will be sent to the NoteShot web app running at `http://localhost:3000`
3. Add notes to your screenshots in the web app
4. Use the "Export Markdown" button to download your notes with screenshots

## Development

This extension works in conjunction with the Next.js web application. The extension sends screenshots to the web app's API, and then stores them in localStorage.

The primary files are:
- `manifest.json`: Extension configuration
- `background.js`: Main background script handling screenshot capture and tab management
- `content.js`: Content script that injects into pages for screenshot capture
- `popup.html/js`: Extension popup UI 