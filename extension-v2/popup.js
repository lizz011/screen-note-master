// Popup script for NoteShot Extension

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const captureBtn = document.getElementById('capture-btn');
  const openEditorBtn = document.getElementById('open-editor-btn');
  const statusMessage = document.getElementById('status-message');
  const screenshotCount = document.getElementById('screenshot-count');
  const lastCaptureTime = document.getElementById('last-capture-time');
  
  // Update UI with current data
  updateScreenshotInfo();
  
  // Add event listeners
  captureBtn.addEventListener('click', captureScreenshot);
  openEditorBtn.addEventListener('click', openEditorPage);
});

/**
 * Capture a screenshot of the current tab
 */
function captureScreenshot() {
  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // Send message to content script to capture screenshot
    chrome.tabs.sendMessage(activeTab.id, { action: 'captureScreenshot' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        return;
      }
      
      console.log('Message sent to content script:', response);
      
      // Close the popup
      window.close();
    });
  });
}

/**
 * Open the editor page
 */
function openEditorPage() {
  chrome.tabs.create({ url: 'editor.html' });
  window.close();
}

/**
 * Update the screenshot count and last capture time in the UI
 */
function updateScreenshotInfo() {
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    const count = screenshots.length;
    
    // Update count
    document.getElementById('screenshot-count').textContent = count;
    
    // Update last capture time
    if (count > 0) {
      const lastScreenshot = screenshots[screenshots.length - 1];
      const timestamp = new Date(lastScreenshot.timestamp);
      document.getElementById('last-capture-time').textContent = formatDate(timestamp);
    } else {
      document.getElementById('last-capture-time').textContent = 'Never';
    }
  });
}

/**
 * Format a date for display
 */
function formatDate(date) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 