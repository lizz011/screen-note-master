# NoteShot Development Phases and Implementation Plan

This document outlines the detailed development phases, steps, and expected results for implementing the NoteShot browser extension MVP as described in the PRD.

## Phase 1: Extension Framework and Basic Structure (1-2 days)

### Steps
1. **Create extension-v2 folder structure**
   - Set up manifest.json with appropriate permissions (tabs, storage, activeTab)
   - Create background.js for event handling
   - Set up popup.html/js for extension UI
   - Configure content scripts for webpage interaction

2. **Set up keyboard shortcut configuration**
   - Define shortcut in manifest.json (e.g., Ctrl+Shift+S)
   - Create event listener in background.js to capture shortcut

3. **Create basic editor.html page**
   - Create standalone HTML page for note editing
   - Set up basic HTML structure with placeholders for screenshots and notes
   - Add basic navigation bar with logo and export button placeholder

### Expected Results
- Extension loads successfully in Chrome
- Keyboard shortcut is registered and detected
- Basic navigation from extension popup to standalone editor page works
- Extension folder structure matches the following pattern:
```
extension-v x /
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── content.js
├── editor.html
├── editor.js
├── styles.css
└── images/
    └── icon128.png (etc.)
```

## Phase 2: Screenshot Implementation and Display (2-3 days)

### Steps
1. **Reuse existing screenshot functionality**
   - Analyze and extract screenshot code from existing extension
   - Implement screenshot capture mechanism in content.js
   - Add function to communicate between content script and background script

2. **Screenshot data transmission**
   - Create method to convert screenshot to base64
   - Implement storage mechanism using localStorage to save screenshot data
   - Create messaging system between extension and editor page

3. **Base64 image display in editor**
   - Implement logic in editor.js to retrieve images from localStorage
   - Create DOM elements to display images in the editor
   - Add basic styling for image display

### Expected Results
- User can take screenshots using keyboard shortcut
- Screenshots are successfully converted to base64 format
- Screenshot data is saved in localStorage
- Editor page displays all captured screenshots in chronological order
- Images are properly sized and styled in the editor page

## Phase 3: Markdown Editor Integration (1-2 days)

### Steps
1. **Select and integrate Markdown editor library**
   - Add SimpleMDE or Toast UI Editor dependency
   - Configure editor options (toolbar, preview, etc.)
   - Implement editor initialization in editor.js

2. **Create editor instances for each screenshot**
   - Implement logic to create a new editor instance for each image
   - Add DOM structure to contain image + editor pairs
   - Ensure proper styling and layout

3. **Implement content saving mechanism**
   - Create function to save editor content to localStorage
   - Implement auto-save functionality (e.g., every 5 seconds)
   - Add event listeners for content changes

### Expected Results
- Each screenshot has a corresponding Markdown editor below it
- Markdown editors function properly with preview mode
- Users can write and format notes in Markdown
- Content is automatically saved to localStorage
- Editor state persists across page refreshes

## Phase 4: Data Storage and Recovery (1-2 days)

### Steps
1. **Design data storage structure**
   - Create JSON schema for storing screenshot + note pairs
   - Implement unique identifiers for each screenshot/note entry
   - Design timestamp-based ordering system

2. **Implement localStorage saving/loading**
   - Create utility functions for saving data to localStorage
   - Implement loading and state recovery on page load
   - Add error handling for storage limits

3. **Add data management features**
   - Implement function to clear old/unnecessary data
   - Add mechanism to check storage usage
   - Create backup/restore functionality

### Expected Results
- Data is properly structured and saved in localStorage
- Page state is fully recovered after refresh or browser restart
- Users don't lose their notes even if they close the browser
- System handles localStorage size limitations gracefully
- Data is organized chronologically with proper timestamps

## Phase 5: Export Function and UI Polish (1-2 days)

### Steps
1. **Implement Markdown export functionality**
   - Create function to compile all screenshots and notes into MD format
   - Convert images to appropriate format for export (base64 or links)
   - Implement Blob creation and download mechanism

2. **Add export button functionality**
   - Connect export button to export function
   - Add visual feedback during export process
   - Include file naming mechanism (date-based or user-defined)

3. **Polish UI and improve UX**
   - Refine styling with Tailwind CSS
   - Add loading indicators and transitions
   - Implement responsive design for different screen sizes
   - Add tooltips and helpful messages

### Expected Results
- Export button generates a properly formatted Markdown file
- Exported file includes all screenshots with their corresponding notes
- Images are properly embedded or linked in the Markdown file
- UI is responsive, intuitive, and visually appealing
- Extension follows modern design principles using Tailwind and shadcn/ui

## Phase 6: Testing and Bug Fixes (1-2 days)

### Steps
1. **Perform manual testing**
   - Test on different websites and scenarios
   - Verify all features work as expected
   - Test edge cases (many screenshots, large notes, etc.)

2. **Browser compatibility testing**
   - Test on different Chrome versions
   - Verify compatibility with other Chromium browsers if applicable
   - Check performance on different operating systems

3. **Bug fixing and optimization**
   - Fix identified issues
   - Optimize performance bottlenecks
   - Refine error handling

### Expected Results
- Extension works reliably across different websites
- All features function as specified in the PRD
- No critical bugs or user experience issues
- Extension performs well even with many screenshots/notes
- All acceptance criteria from the PRD are met

## Future Expansion Considerations

### Database Integration (Post-MVP)
- Research and select appropriate Vercel Neon setup
- Design database schema for notes and user preferences
- Implement authentication system
- Create API endpoints for data synchronization

### Feature Enhancements (Post-MVP)
- Implement categorization and tagging system
- Add search functionality across notes
- Create note sharing capabilities
- Implement OCR for text recognition in screenshots

## Development Testing Matrix

| Feature | Test Cases | Expected Results |
|---------|------------|------------------|
| Screenshot | Take screenshot with shortcut | Image captured, saved, and displayed in editor |
| Screenshot | Take screenshot from popup | Image captured, saved, and displayed in editor |
| Markdown Editor | Enter and format text | Text appears with proper formatting in preview |
| Auto-save | Edit text and refresh page | All edits are preserved after refresh |
| Export | Click export button | .md file downloads with correct content |
| Multiple Screenshots | Take several screenshots | All images display in correct order with editors | 