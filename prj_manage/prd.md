# NoteShot Browser Extension - MVP Phase Product Requirements Document (PRD)

## I. Product Overview

### Product Name
NoteShot

### Product Positioning
NoteShot is a two-part system consisting of a browser extension and web application. The extension allows users to quickly take screenshots while watching online courses or reading materials using keyboard shortcuts. All screenshots are sent to the web application where users can view, add Markdown notes below each image, and export everything with one click, facilitating later organization, output, and review.

## II. Core Features

### Functional Goals (MVP Scope)

| Feature Module | Description |
| --- | --- |
| Quick Screenshot (Extension) | Use keyboard shortcuts to capture the current visible area of the browser |
| Web Application | Next.js application to display and manage screenshots and notes |
| Markdown Notes | Provide a Markdown editor under each image for note-taking |
| Data Storage | Data initially saved in browser's localStorage, later transitioning to Vercel Neon database |
| Export Function | One-click export of current notes as .md file, including image links (base64 or relative paths) |

## III. Interface and Interaction Description

### Entry Points
- Users click the extension icon popup or use keyboard shortcuts to take screenshots
- Extension sends screenshot data to web application via API
- Extension redirects user to the web application or provides a link

### Web Application Structure
```
+----------------------------------------------------+
| NoteShot Web App Navigation Bar (Logo + Export Button) |
+----------------------------------------------------+

  [Image 1]
  📝 Markdown Editing Area (SimpleMDE or ToastUI)

  [Image 2]
  📝 Markdown Editing Area

  ...

+-------------------------+
|      Export Markdown    |
+-------------------------+
```

## IV. Technical Design

### System Architecture
```
+----------------+          +-------------------+
| Chrome Extension|  POST   | Next.js Web App   |
| (Screen Capture)| ------> | (Display+Edit+Export)|
+----------------+  Request  +-------------------+
                                    |
                                    | Save
                                    v
                            +------------------+
                            | Storage Layer    |
                            | (Initially Local,|
                            |  Later Vercel DB)|
                            +------------------+
```

### Project Structure
```
├── browser-extension/     ← Chrome Extension component
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html/js
│   └── content.js
│
└── web-app/               ← Next.js Web Application
    ├── pages/             ← Page components
    │   ├── index.js       ← Main note page
    │   └── api/
    │       └── note.js    ← API endpoint for receiving screenshots
    ├── components/        ← Reusable UI components
    └── lib/               ← Utilities and database connections
```

### Technical Details

| Feature | Technical Solution |
| --- | --- |
| Screenshot | Extension captures screenshots and sends to web app |
| Web App API | Next.js API route to receive and store screenshots |
| Markdown Editor | Use SimpleMDE or Toast UI Editor integrated into Next.js app |
| Data Storage | Initial version: localStorage<br>Later version: Vercel Neon PostgreSQL |
| Image Storage | Initial version: base64 directly in localStorage<br>Later version: Blob storage with DB references |
| Export Function | Server-side generating .md file for download |

### Technology Stack
- **Frontend Framework:** Next.js (for building the web application)
- **Component Library:** shadcn/ui (providing pre-built accessible UI components)
- **Styling:** Tailwind CSS (for utility-first styling)
- **State Management:** Jotai (for efficient state management between components)
- **Database:** Initially localStorage, later Vercel Neon (PostgreSQL serverless database for storing user preferences and notes)
- **Extension:** Chrome Extension API (manifest v3)

## V. Acceptance Criteria

| Feature | Acceptance Conditions |
| --- | --- |
| Extension Screenshot | After pressing shortcut, screenshot is captured and sent to web app |
| Web App Receiving | Web app successfully receives and stores screenshots from extension |
| Image Display | Images can be displayed sequentially on the web app |
| Markdown Writable | Markdown area below each image works normally, with preview support |
| Auto-save | Data can be recovered after page refresh |
| Export Success | Clicking "Export" generates and downloads .md file including image links and note text |

## VI. Development and Testing Time Recommendations

| Phase | Content |
| --- | --- |
| 🧱 Extension and Web App Basic Structure | 2-3 days |
| 📸 Screenshot implementation + API integration | 2-3 days |
| 📝 Embedding Markdown editor in Next.js | 1-2 days |
| 💾 Local data saving and recovery | 1-2 days |
| 📤 Export Markdown function + UI adjustments | 1-2 days |
| 🔄 Migration to Vercel DB | 2-3 days |
| ✅ Testing and fixes | 1-2 days |

## VII. System Architecture - Detailed

This project contains two main parts:
1. **Chrome Extension Part**: Responsible for screenshot functionality, transmitting screenshot data to the web application via API
2. **Next.js Web Application**: Responsible for receiving, storing, displaying screenshots, note editing, and export functions

### Data Flow
1. User takes screenshot using extension
2. Extension captures screenshot as base64 data
3. Extension sends data to web app via POST request to API endpoint
4. Web app stores data (localStorage initially, Vercel DB later)
5. Web app displays link to user or redirects automatically
6. User can view, edit, and export notes on the web app

## VIII. Future Feature Plans
- User Authentication: Login system for saving personal notes
- Cloud Sync: Full migration to Vercel Neon database for persistent storage
- Note Organization: Add tags and folder functionality
- Smart Recognition: OCR recognition of text in screenshots
- Search Function: Search note content
- Sharing Function: Generate shareable note links 