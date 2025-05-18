// Content script for NoteShot Extension

/**
 * Initialize the event listeners
 */
init();

function init() {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    if (message.action === 'captureScreenshot') {
      captureFullPageScreenshot();
      sendResponse({ status: 'capturing' });
    }
    
    return true; // Indicates async response
  });
}

/**
 * Capture a screenshot of the entire visible page
 */
function captureFullPageScreenshot() {
  console.log('Capturing full page screenshot');
  
  // Get current page info
  const pageUrl = window.location.href;
  const pageTitle = document.title;
  
  // Request the background script to capture the tab
  chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
    if (response && response.status === 'success') {
      const dataUrl = response.dataUrl;
      
      // Show notification to user
      showCaptureNotification();
      
      // Send the captured screenshot back to the background script
      chrome.runtime.sendMessage({
        action: 'screenshotCaptured',
        dataUrl: dataUrl,
        pageUrl: pageUrl,
        pageTitle: pageTitle
      }, (response) => {
        console.log('Screenshot processed:', response);
      });
    } else {
      console.error('Failed to capture screenshot:', response ? response.error : 'Unknown error');
      showErrorNotification();
    }
  });
}

/**
 * Show a notification that the screenshot has been captured
 */
function showCaptureNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '15px 20px';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.zIndex = '2147483648';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  notification.textContent = 'Screenshot captured! Sending to NoteShot web app...';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Show an error notification
 */
function showErrorNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '15px 20px';
  notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.zIndex = '2147483648';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  notification.textContent = 'Error capturing screenshot. Please try again.';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
} 