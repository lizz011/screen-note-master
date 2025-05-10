# Test Procedure for OCR Subtitle Recognition Extension
## Feature 5.1: Screenshot Capture

This document outlines the test procedure for the Screenshot Capture feature (5.1) of the OCR Subtitle Recognition browser extension. The tests focus on verifying the functionality of selecting a subtitle region, capturing screenshots, and storing user preferences.

## Prerequisites

1. Chrome browser installed
2. OCR Subtitle Recognition extension loaded in developer mode
3. A webpage with video content that has subtitles (e.g., YouTube, Netflix, etc.)

## Test Cases

### 1. Extension Loading

| Test ID | TC-5.1-1 |
| --- | --- |
| **Description** | Verify that the extension loads properly in Chrome |
| **Steps** | 1. Open Chrome browser<br>2. Go to chrome://extensions/<br>3. Enable Developer mode<br>4. Click "Load unpacked" and select the extension directory<br>5. Click on the extension icon in the toolbar |
| **Expected Result** | - Extension should load without errors<br>- Popup should open with "Capture Subtitle" and "Reset Region" buttons<br>- Status message should indicate no region is set |
| **Status** | To be tested |

### 2. Keyboard Shortcut Recognition

| Test ID | TC-5.1-2 |
| --- | --- |
| **Description** | Verify that the keyboard shortcut (Ctrl+Shift+S) works |
| **Steps** | 1. Navigate to a webpage with video content<br>2. Press Ctrl+Shift+S |
| **Expected Result** | - Selection overlay should appear<br>- User should be prompted to select a region |
| **Status** | To be tested |

### 3. Region Selection - First Time Use

| Test ID | TC-5.1-3 |
| --- | --- |
| **Description** | Verify that users can select a subtitle region on first use |
| **Steps** | 1. Open a video page<br>2. Click the extension icon<br>3. Click "Capture Subtitle" button<br>4. Select a rectangular region around the subtitle area by clicking and dragging |
| **Expected Result** | - Overlay should allow region selection<br>- After selection, a notification should confirm the capture<br>- Selection coordinates should be saved |
| **Status** | To be tested |

### 4. Region Persistence

| Test ID | TC-5.1-4 |
| --- | --- |
| **Description** | Verify that the selected region is remembered between captures |
| **Steps** | 1. After completing TC-5.1-3, navigate to a different video<br>2. Open the extension popup<br>3. Verify the status message shows region dimensions<br>4. Click "Capture Subtitle" again |
| **Expected Result** | - Status should show the previously selected region dimensions<br>- Clicking capture should directly take a screenshot of the same region (no selection overlay)<br>- A notification should confirm the capture |
| **Status** | To be tested |

### 5. Region Reset

| Test ID | TC-5.1-5 |
| --- | --- |
| **Description** | Verify that the "Reset Region" button clears the saved region |
| **Steps** | 1. Open the extension popup after a region has been set<br>2. Click the "Reset Region" button<br>3. Observe the status message<br>4. Click "Capture Subtitle" |
| **Expected Result** | - Status should indicate no region is set<br>- Clicking capture should prompt for region selection again<br>- Preview image should be cleared |
| **Status** | To be tested |

### 6. Screenshot Display in Popup

| Test ID | TC-5.1-6 |
| --- | --- |
| **Description** | Verify that captured screenshots appear in the popup |
| **Steps** | 1. Capture a subtitle region<br>2. Open the extension popup |
| **Expected Result** | - The preview section should display the captured region<br>- The text result section should show a placeholder message about OCR being implemented in feature 5.2 |
| **Status** | To be tested |

### 7. Performance Test

| Test ID | TC-5.1-7 |
| --- | --- |
| **Description** | Verify that the capture process is fast and doesn't interrupt video playback |
| **Steps** | 1. Play a video with subtitles<br>2. Use the keyboard shortcut to capture a region<br>3. Observe if video playback is affected |
| **Expected Result** | - Capture process should complete within 1 second<br>- Video playback should not be interrupted or significantly affected |
| **Status** | To be tested |

### 8. Multiple Webpage Compatibility

| Test ID | TC-5.1-8 |
| --- | --- |
| **Description** | Verify that the extension works across different websites |
| **Steps** | 1. Test the capture feature on at least 3 different video platforms:<br>   - YouTube<br>   - Netflix<br>   - Other video streaming platform |
| **Expected Result** | - Region selection and capture should work consistently across all tested platforms |
| **Status** | To be tested |

## Bug Reporting

When reporting bugs, please include:
1. Test ID reference
2. Browser version
3. Steps to reproduce
4. Expected vs. actual result
5. Screenshots/videos if applicable

## Test Environment

- **Browser:** Chrome (latest version)
- **OS:** Windows/macOS/Linux
- **Test Date:** [Date]
- **Tester:** [Name] 