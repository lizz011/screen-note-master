// Background script for NoteShot Extension

// Configuration
const WEB_APP_URL = 'http://localhost:3000'; // Change to production URL when deployed
const API_ENDPOINT = `${WEB_APP_URL}/api/note`;

// Track the currently open editor tab
let editorTabId = null;

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

    // Send the screenshot data to the web app API and save to localStorage
    saveScreenshotAndOpenEditor(screenshotData, sendResponse);
    return true; // Indicates async response
  }
});

/**
 * Save screenshot data to localStorage and open/refresh the editor
 */
function saveScreenshotAndOpenEditor(screenshotData, sendResponse) {
  console.log('Saving screenshot and opening editor');
  
  // First, save to local storage directly in the browser
  try {
    saveToLocalStorage(screenshotData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  // Then send to web app API
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
    
    // Check if editor tab is already open
    if (editorTabId) {
      // Check if the tab still exists
      chrome.tabs.get(editorTabId, function(tab) {
        if (chrome.runtime.lastError) {
          // Tab doesn't exist anymore, create a new one
          createEditorTab(data.viewUrl);
        } else {
          // Tab exists, refresh it
          chrome.tabs.update(editorTabId, { 
            active: true,
            url: data.viewUrl
          });
        }
      });
    } else {
      // No editor tab open, create a new one
      createEditorTab(data.viewUrl);
    }
    
    sendResponse({ status: 'success', data: data });
  })
  .catch(error => {
    console.error('Error sending screenshot to web app:', error);
    
    // Even if API fails, we'll open the web app with our locally saved data
    if (editorTabId) {
      chrome.tabs.update(editorTabId, { active: true });
    } else {
      createEditorTab(WEB_APP_URL);
    }
    
    sendResponse({ status: 'error', error: error.message });
  });
}

/**
 * Create a new editor tab and track its ID
 */
function createEditorTab(url) {
  chrome.tabs.create({ url: url }, function(tab) {
    editorTabId = tab.id;
    
    // Listen for tab close
    chrome.tabs.onRemoved.addListener(function tabCloseListener(tabId) {
      if (tabId === editorTabId) {
        editorTabId = null;
        chrome.tabs.onRemoved.removeListener(tabCloseListener);
      }
    });
  });
}

/**
 * Save screenshot data to local storage
 */
function saveToLocalStorage(screenshotData) {
  // First try to retrieve existing screenshots from local storage
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    screenshots.push(screenshotData);
    
    // Save updated screenshots array
    chrome.storage.local.set({ screenshots: screenshots }, () => {
      console.log('Screenshot saved to local storage');
      
      // Also send the screenshot to the web page's localStorage via content script
      // This ensures both the extension and the web app have the same data
      sendToWebAppLocalStorage(screenshotData);
    });
  });
}

/**
 * Send screenshot to web app's localStorage
 */
function sendToWebAppLocalStorage(screenshotData) {
  // Check if editor tab is open
  if (editorTabId) {
    // Inject script to update localStorage
    const code = `
      (function() {
        try {
          // Get existing screenshots from localStorage
          const storedData = localStorage.getItem('screenshots');
          const screenshots = storedData ? JSON.parse(storedData) : [];
          
          // Add new screenshot
          screenshots.push(${JSON.stringify(screenshotData)});
          
          // Save back to localStorage
          localStorage.setItem('screenshots', JSON.stringify(screenshots));
          
          // Dispatch a custom event to notify the app
          window.dispatchEvent(new CustomEvent('screenshotAdded', { 
            detail: ${JSON.stringify(screenshotData)}
          }));
          
          console.log('Screenshot added to web app localStorage');
          return true;
        } catch (error) {
          console.error('Error updating localStorage:', error);
          return false;
        }
      })();
    `;
    
    chrome.scripting.executeScript({
      target: { tabId: editorTabId },
      function: function(screenshotData) {
        try {
          // Get existing screenshots from localStorage
          const storedData = localStorage.getItem('screenshots');
          const screenshots = storedData ? JSON.parse(storedData) : [];
          
          // Add new screenshot
          screenshots.push(screenshotData);
          
          // Save back to localStorage
          localStorage.setItem('screenshots', JSON.stringify(screenshots));
          
          // Dispatch a custom event to notify the app
          window.dispatchEvent(new CustomEvent('screenshotAdded', { 
            detail: screenshotData
          }));
          
          console.log('Screenshot added to web app localStorage');
          return true;
        } catch (error) {
          console.error('Error updating localStorage:', error);
          return false;
        }
      },
      args: [screenshotData]
    }).catch(error => {
      console.error('Error executing script:', error);
    });
  }
} 