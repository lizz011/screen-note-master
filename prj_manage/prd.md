# NoteShot Browser Extension - MVP Phase Product Requirements Document (PRD)

## I. Product Overview

### Product Name
NoteShot

### Product Positioning
NoteShot is a browser extension targeting web learners, allowing users to quickly take screenshots while watching online courses or reading materials using keyboard shortcuts. All screenshots are displayed in a standalone webpage where users can add Markdown notes below each image and export everything with one click, facilitating later organization, output, and review.

## II. Core Features

### Functional Goals (MVP Scope)

| Feature Module | Description |
| --- | --- |
| Quick Screenshot | Use keyboard shortcuts to capture the current visible area of the browser |
| Web Display | All screenshots automatically display in a note webpage |
| Markdown Notes | Provide a Markdown editor under each image for note-taking |
| Auto-save | Page data saved locally (localStorage), later will use Vercel Neon database |
| Export Function | One-click export of current notes as .md file, including image links (base64 or relative paths) |

## III. Interface and Interaction Description

### Entry Points
- Users click the extension icon popup or use keyboard shortcuts to take screenshots
- Extension opens editor.html (standalone notes page)

### Editor Page Structure (editor.html)
```
+----------------------------------------------------+
| NoteShot Editor Page Navigation Bar (Logo + Export Button) |
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

### Project Structure
Additions to existing technology:
```
├── editor.js             ← Rendering screenshots + Markdown area logic
├── editor.html           ← Standalone notes page
├── images/               ← Storing screenshot images
```

### Technical Details

| Feature | Technical Solution |
| --- | --- |
| Screenshot | Reuse existing screenshot functionality in the extension |
| Markdown Editor | Use SimpleMDE or Toast UI Editor |
| Local Storage | Use localStorage or IndexedDB to save screenshots and note content |
| Image Storage | Initially use base64 directly rendered in HTML (for easier first version development) |
| Export Function | Concatenate Markdown strings via JS, download .md file using Blob |

### Technology Stack
- **Frontend Framework:** Next.js (for building the standalone web editor interface)
- **Component Library:** shadcn/ui (providing pre-built accessible UI components)
- **Styling:** Tailwind CSS (for utility-first styling)
- **State Management:** Jotai (for efficient state management between components)
- **Database:** Initially localStorage, later Vercel Neon (PostgreSQL serverless database for storing user preferences and notes)

## V. Acceptance Criteria

| Feature | Acceptance Conditions |
| --- | --- |
| Screenshot Success | After pressing shortcut, screenshot is generated and redirects to editor page |
| Image Display | Images can be displayed sequentially on the page |
| Markdown Writable | Markdown area below each image works normally, with preview support |
| Auto-save | Data can be recovered after page refresh |
| Export Success | Clicking "Export" generates and downloads .md file including image links and note text |

## VI. Development and Testing Time Recommendations

| Phase | Content |
| --- | --- |
| 🧱 Extension framework + Shortcuts + Page Navigation | 1-2 days |
| 📸 Screenshot implementation + base64 image display | 2-3 days |
| 📝 Embedding Markdown editor | 1-2 days |
| 💾 Local data saving and recovery | 1-2 days |
| 📤 Export Markdown function + UI adjustments | 1-2 days |
| ✅ Testing and fixes | 1-2 days |

## VII. System Architecture

This project contains two main parts:
1. **Chrome Extension Part**: Responsible for screenshot functionality, transmitting screenshot data to the standalone webpage
2. **Standalone Webpage Part**: Responsible for note editing, saving, and export functions

### Data Flow
```
+----------------+          +-------------------+
| Chrome Extension|  Screenshot| Standalone Web Editor|
| (Screen Capture)| -------> | (Display+Edit+Export)|
+----------------+     Data   +-------------------+
                                    |
                                    | Save
                                    v
                            +-----------------+
                            | Local Storage   |
                            | (localStorage)  |
                            +-----------------+
```

## VIII. Future Feature Plans
- Cloud Sync: Save notes to Vercel Neon database
- Note Organization: Add tags and folder functionality
- Smart Recognition: OCR recognition of text in screenshots
- Search Function: Search note content
- Sharing Function: Generate shareable note links 