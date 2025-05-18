# NoteShot Development Phases and Implementation Plan

This document outlines the detailed development phases, steps, and expected results for implementing the NoteShot system (browser extension + web application) as described in the PRD.

## Phase 1: System Architecture and Basic Structure 

### Steps
1. **Set up Next.js Web Application**
   - Create Next.js project with TypeScript
   - Configure Tailwind CSS and shadcn/ui
   - Set up basic page structure and routing
   - Create placeholder components for screenshots and notes

2. **Create Chrome Extension Structure**
   - Set up manifest.json with appropriate permissions (tabs, storage, activeTab)
   - Create background.js for event handling
   - Set up popup.html/js for extension UI
   - Configure content scripts for webpage interaction

3. **Set up keyboard shortcut configuration**
   - Define shortcut in manifest.json (e.g., Ctrl+Shift+S)
   - Create event listener in background.js to capture shortcut

4. **Implement basic API endpoint in Next.js**
   - Create API route at /api/note
   - Add placeholder logic for receiving screenshot data
   - Set up CORS to allow requests from the extension

### Expected Results
- Next.js application loads successfully in browser
- Extension loads successfully in Chrome
- Keyboard shortcut is registered and detected
- Basic Next.js pages structure and routes are functional
- API endpoint is accessible and returns appropriate responses
- Project structure follows this pattern:

```
/browser-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── content.js
└── images/
    └── icon128.png (etc.)

/web-app/
├── pages/
│   ├── index.tsx
│   ├── _app.tsx
│   └── api/
│       └── note.ts
├── components/
│   ├── Screenshot.tsx
│   └── MarkdownEditor.tsx
├── styles/
│   └── globals.css
└── public/
```

## Phase 2: Screenshot Implementation and API Integration

### Steps
1. **Implement screenshot capture in extension**
   - Create screenshot capture mechanism in content.js
   - Implement function to convert screenshots to base64
   - Add function to communicate between content script and background script

2. **Build API data transmission**
   - Create fetch POST request functionality in extension
   - Implement data structure for screenshot transmission
   - Add error handling and retry logic

3. **Enhance API endpoint in Next.js**
   - Implement data validation for incoming screenshots
   - Add localStorage logic to save screenshots
   - Create response with link to view saved screenshot

4. **Basic web app UI implementation**
   - Create UI layout for displaying screenshots
   - Implement screenshot list display
   - Add placeholder for Markdown editor

### Expected Results
- User can take screenshots using keyboard shortcut
- Screenshots are successfully captured and converted to base64
- Extension sends screenshots to web app API
- Web app receives and stores screenshots in localStorage
- Basic web app UI displays screenshots
- API responses include links to view screenshots in web app
- Web app displays captured screenshots in chronological order

## Phase 3: Markdown Editor Integration

### Steps
1. **Select and integrate Markdown editor library**
   - Add SimpleMDE or Toast UI Editor dependency
   - Create Markdown editor component in Next.js
   - Configure editor options (toolbar, preview, etc.)

2. **Implement editor instances for each screenshot**
   - Add logic to create editor instance for each screenshot
   - Create UI components for image + editor pairs
   - Ensure proper styling and layout

3. **Implement content saving mechanism**
   - Create function to save editor content to localStorage
   - Implement auto-save functionality
   - Add logic to associate notes with specific screenshots

### Expected Results
- Each screenshot has a corresponding Markdown editor below it
- Markdown editors function properly with preview mode
- Users can write and format notes in Markdown
- Content is automatically saved to localStorage
- Editor state persists across page refreshes

## Phase 4: Data Storage and Recovery

### Steps
1. **Design data storage structure**
   - Create JSON schema for storing screenshot + note pairs
   - Implement unique identifiers for each screenshot/note entry
   - Design timestamp-based ordering system

2. **Implement localStorage persistence**
   - Create utility functions for saving/loading from localStorage
   - Implement state recovery on page load
   - Add error handling for storage limits

3. **Implement basic session management**
   - Create functionality to handle multiple sessions
   - Add basic data organization features
   - Implement "clear data" functionality

### Expected Results
- Data is properly structured and saved in localStorage
- Page state is fully recovered after refresh or browser restart
- Users don't lose their notes even if they close the browser
- System handles localStorage size limitations gracefully
- Data is organized chronologically with proper timestamps

## Phase 5: Export Function and UI Polish

### Steps
1. **Implement Markdown export functionality**
   - Create function to compile all screenshots and notes into MD format
   - Convert images to appropriate format for export
   - Implement server-side Blob creation and download mechanism

2. **Add export button functionality**
   - Connect export button to export function
   - Add visual feedback during export process
   - Include file naming mechanism (date-based or user-defined)

3. **Polish UI and improve UX**
   - Refine styling with Tailwind CSS and shadcn/ui
   - Add loading indicators and transitions
   - Implement responsive design for different screen sizes
   - Add tooltips and helpful messages

### Expected Results
- Export button generates a properly formatted Markdown file
- Exported file includes all screenshots with corresponding notes
- Images are properly embedded or linked in the Markdown file
- UI is responsive, intuitive, and visually appealing
- Application follows modern design principles with Tailwind and shadcn/ui

## Phase 6: Database Migration

### Steps
1. **Set up Vercel Neon Database**
   - Create PostgreSQL database in Vercel
   - Set up connection in Next.js application
   - Design database schema for screenshots and notes

2. **Implement API endpoints for database operations**
   - Create CRUD endpoints for screenshots and notes
   - Update existing API to use database instead of localStorage
   - Add migration utility for existing localStorage data

3. **Update frontend to use database API**
   - Modify components to fetch data from API
   - Update save/load functions to use database endpoints
   - Add error handling for database operations

### Expected Results
- Application successfully stores data in Vercel Neon database
- Database schema properly represents screenshots and notes
- Migration utility allows moving from localStorage to database
- API endpoints provide consistent data access
- Performance remains fast even with database operations

## Phase 7: Testing and Bug Fixes

### Steps
1. **Perform complete system testing**
   - Test extension on different websites and scenarios
   - Verify all features work as expected
   - Test edge cases (many screenshots, large notes, etc.)

2. **Cross-browser compatibility testing**
   - Test on different Chrome versions
   - Verify compatibility with other Chromium browsers
   - Check performance on different operating systems

3. **Bug fixing and optimization**
   - Fix identified issues
   - Optimize performance bottlenecks
   - Refine error handling

### Expected Results
- System works reliably across different websites
- All features function as specified in the PRD
- No critical bugs or user experience issues
- System performs well even with many screenshots/notes
- All acceptance criteria from the PRD are met

## Future Expansion Considerations

### User Authentication
- Implement user login/signup system
- Create user profile and settings page
- Add data separation between users

### Advanced Features
- Implement categorization and tagging system
- Add search functionality across notes
- Create note sharing capabilities
- Implement OCR for text recognition in screenshots

## Development Testing Matrix

| Feature | Test Cases | Expected Results |
|---------|------------|------------------|
| Screenshot | Take screenshot with shortcut | Image captured, sent to web app, and displayed |
| Web App API | Send test payload to API | Data received and stored correctly |
| Markdown Editor | Enter and format text | Text appears with proper formatting in preview |
| Auto-save | Edit text and refresh page | All edits are preserved after refresh |
| Export | Click export button | .md file downloads with correct content |
| Database | Store and retrieve screenshots | Data persists and loads correctly |
| Extension-Web Communication | Extension sends data to web | Web app processes and displays data correctly | 