# Product Requirements Document (PRD)
## Screenshot + OCR Subtitle Recognition Browser Extension
### Version 0.1

## 1. Introduction
This document outlines the requirements for developing a browser extension that enables users to capture screenshots of subtitle areas in English videos and automatically recognize the text content using OCR technology. This initial version (V0.1) focuses solely on screenshot capture and text recognition functionality.

## 2. Product Overview
The extension allows users to press a keyboard shortcut to capture the subtitle area of a video they're watching. The captured image is then processed using OCR to extract the text, which is displayed in the extension's popup interface. The solution aims to provide quick and accurate subtitle text extraction for English language content.

## 3. Target Users
- English language learners
- Viewers who want to capture and save subtitle text
- Users who need to reference or search for dialog from videos

## 4. User Stories
- As a user, I want to press a keyboard shortcut to capture the subtitle area of a video I'm watching
- As a user, I want to select and save the subtitle area the first time I use the extension
- As a user, I want the extension to remember my selected subtitle area for future captures
- As a user, I want to see the recognized text in the extension popup
- As a user, I want the text recognition to be fast and accurate

## 5. Feature Requirements

### 5.1 Screenshot Capture
- **Priority:** High
- **Description:** Enable users to capture a specific region of the screen containing subtitles
- **Requirements:**
  - Implement keyboard shortcut (Ctrl+Shift+S) to trigger screenshot
  - Allow first-time users to select and save a rectangular region for subtitle area
  - Store and reuse the selected region for future captures
  - Implement screenshot mechanism compatible with webpage content (canvas or getDisplayMedia)
  - Ensure the capture process is fast and doesn't interrupt video playback

### 5.2 OCR Text Recognition
- **Priority:** High
- **Description:** Process the captured image to extract subtitle text
- **Requirements:**
  - Integrate tesseract.js OCR engine
  - Configure OCR for English language detection only (lang = 'eng')
  - Optimize OCR settings for subtitle text recognition
  - Process the image and extract text within 1 second
  - Achieve text recognition accuracy above 85%

<!-- 
### 5.3 Extension Popup Interface
- **Priority:** Medium
- **Description:** Provide a simple interface to trigger the capture and display results
- **Requirements:**
  - Create a button to manually trigger screenshot + OCR process
  - Display the recognized text in a clean, readable format
  - Provide basic instructions for first-time users
  - Design a simple, intuitive UI using Tailwind CSS and Shadcn UI -->

## 6. Technical Requirements

### 6.1 Technology Stack
- **Frontend Framework:** Next.js (primary framework for building the extension UI)
- **Component Library:** shadcn/ui (for pre-built accessible UI components)
- **Styling:** Tailwind CSS (for utility-first styling)
- **OCR Engine:** tesseract.js (for text recognition)
- **State Management:** Jotai (for efficient state management across components)
- **Database:** Vercel Neon (PostgreSQL serverless database for storing user preferences and potentially saved subtitles)
- **Build Output:** Static HTML, JS, CSS files compatible with Chrome extension format

### 6.2 Browser Compatibility
- Chrome (primary target)
- Other Chromium-based browsers (Edge, Brave, etc.)

### 6.3 Performance Requirements
- OCR response time: < 1 second for subtitle area screenshots
- Text recognition accuracy: > 85%
- Extension load time: < 500ms

## 8. Success Metrics
- User adoption rate
- OCR accuracy measurements
- User feedback on extension usefulness
- Performance metrics (processing time)

## 9. Timeline
- V0.1: Focus on core screenshot + OCR functionality
- Future versions will expand to include vocabulary tools and additional features

## 10. Appendix
### 10.1 Key Technical Challenges
- Accurately capturing the subtitle region across different video players
- Optimizing OCR for various subtitle styles and backgrounds
- Ensuring consistent performance across websites
- Setting up database connectivity through the browser extension

### 10.2 References
- [tesseract.js Documentation](https://github.com/naptha/tesseract.js)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Vercel Neon Documentation](https://neon.tech/docs/introduction)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Jotai Documentation](https://jotai.org/docs/introduction) 