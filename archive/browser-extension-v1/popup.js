// Popup script for NoteShot Extension

// Configuration
const WEB_APP_URL = 'http://localhost:3000'; // Change to production URL when deployed

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const captureBtn = document.getElementById('capture-btn');
  const openWebAppBtn = document.getElementById('open-webapp-btn');
  const statusMessage = document.getElementById('status-message');
  
  // Add event listeners
  captureBtn.addEventListener('click', captureScreenshot);
  openWebAppBtn.addEventListener('click', openWebApp);
});

/**
 * Capture a screenshot of the current tab
 */
function captureScreenshot() {
  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // Update status
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = 'Capturing screenshot...';
    
    // Send message to content script to capture screenshot
    chrome.tabs.sendMessage(activeTab.id, { action: 'captureScreenshot' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        statusMessage.textContent = 'Error capturing screenshot. Please try again.';
        return;
      }
      
      console.log('Message sent to content script:', response);
      statusMessage.textContent = 'Screenshot captured! Sending to web app...';
      
      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    });
  });
}

/**
 * Open the NoteShot web app
 */
function openWebApp() {
  chrome.tabs.create({ url: WEB_APP_URL });
  window.close();
} 