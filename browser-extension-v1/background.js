// Background script for NoteShot Extension

// Configuration
const WEB_APP_URL = 'http://localhost:3000'; // Change to production URL when deployed
const API_ENDPOINT = `${WEB_APP_URL}/api/note`;

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  if (command === 'take-screenshot') {
    // When shortcut is pressed, capture the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { 
        action: 'captureScreenshot'
      });
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  
  // Handle request to capture visible tab
  if (message.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Error capturing tab:', chrome.runtime.lastError);
        sendResponse({ status: 'error', error: chrome.runtime.lastError });
      } else {
        console.log('Tab captured successfully');
        sendResponse({ status: 'success', dataUrl: dataUrl });
      }
    });
    return true; // Indicates async response
  }
  
  // When a screenshot is captured, send it to the web app
  if (message.action === 'screenshotCaptured') {
    const timestamp = new Date().toISOString();
    const screenshotData = {
      id: `screenshot_${timestamp}`,
      dataUrl: message.dataUrl,
      timestamp: timestamp,
      notes: "",
      pageUrl: message.pageUrl,
      pageTitle: message.pageTitle
    };

    // Send the screenshot data to the web app API
    sendScreenshotToWebApp(screenshotData, sendResponse);
    return true; // Indicates async response
  }
});

/**
 * Send screenshot data to the web app API
 */
function sendScreenshotToWebApp(screenshotData, sendResponse) {
  console.log('Sending screenshot to web app API');
  
  // For development: also save to local storage as backup
  saveToLocalStorage(screenshotData);
  
  // Send to web app API
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(screenshotData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Screenshot sent to web app:', data);
    
    // Open the web app page with the new screenshot
    chrome.tabs.create({ url: data.viewUrl });
    
    sendResponse({ status: 'success', data: data });
  })
  .catch(error => {
    console.error('Error sending screenshot to web app:', error);
    
    // In case of error, show a notification and provide a link to the web app
    chrome.tabs.create({ url: WEB_APP_URL });
    
    sendResponse({ status: 'error', error: error.message });
  });
}

/**
 * Save screenshot data to local storage as backup
 */
function saveToLocalStorage(screenshotData) {
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    screenshots.push(screenshotData);
    
    // Save updated screenshots array
    chrome.storage.local.set({ screenshots: screenshots }, () => {
      console.log('Screenshot saved to local storage as backup');
    });
  });
} 