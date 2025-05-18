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
  
  // First, try making a direct API call to ensure data is sent
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(screenshotData)
  })
  .then(response => {
    console.log('API direct response status:', response.status);
    return response.json();
  })
  .catch(error => {
    console.warn('Direct API call failed, will try through tab:', error);
  });
  
  // Then, check if there are any existing tabs with the web app
  chrome.tabs.query({ url: "http://localhost:3000/*" }, (tabs) => {
    if (tabs && tabs.length > 0) {
      // Web app is already open, update editorTabId and send data
      console.log('Found existing web app tab:', tabs[0].id);
      editorTabId = tabs[0].id;
      
      // Make the tab active (focus it)
      chrome.tabs.update(editorTabId, { active: true });
      
      // Update localStorage in the web app tab and send event
      updateWebAppLocalStorage(screenshotData);
      
      // Respond to the content script
      sendResponse({ status: 'success', message: 'Screenshot added to existing tab' });
    } else {
      // No existing web app tab, send data to API and open new tab
      sendScreenshotToAPI(screenshotData, sendResponse);
    }
  });
}

/**
 * Send the screenshot to the API and handle response
 */
function sendScreenshotToAPI(screenshotData, sendResponse) {
  console.log('Sending screenshot to API:', API_ENDPOINT);
  
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(screenshotData)
  })
  .then(response => {
    console.log('API response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Screenshot sent to web app:', data);
    
    // Create a new tab with the base URL + ID parameter (use a valid URL format)
    const urlWithId = `${WEB_APP_URL}/?id=${screenshotData.id}`;
    chrome.tabs.create({ url: urlWithId }, function(tab) {
      editorTabId = tab.id;
      
      // Listen for tab close
      chrome.tabs.onRemoved.addListener(function tabCloseListener(tabId) {
        if (tabId === editorTabId) {
          editorTabId = null;
          chrome.tabs.onRemoved.removeListener(tabCloseListener);
        }
      });
      
      // Wait a bit to let the page load, then add a listener for complete status
      setTimeout(() => {
        // Define a listener that waits for the page to fully load
        const tabLoadListener = function(tabId, changeInfo, tabInfo) {
          // Only handle updates for our tab and when it's complete
          if (tabId === editorTabId && changeInfo.status === 'complete') {
            console.log('Tab fully loaded, updating localStorage');
            
            // Give the web app a moment to initialize
            setTimeout(() => {
              updateWebAppLocalStorage(screenshotData);
            }, 500);
            
            // Remove this listener once it's done its job
            chrome.tabs.onUpdated.removeListener(tabLoadListener);
          }
        };
        
        // Add the listener
        chrome.tabs.onUpdated.addListener(tabLoadListener);
      }, 100);
    });
    
    sendResponse({ status: 'success', data: data });
  })
  .catch(error => {
    console.error('Error sending screenshot to web app:', error);
    
    // Create new tab with basic URL on error
    chrome.tabs.create({ url: WEB_APP_URL }, function(tab) {
      editorTabId = tab.id;
      
      // We'll still try to add the screenshot to localStorage after a delay
      setTimeout(() => {
        updateWebAppLocalStorage(screenshotData);
      }, 2000); // Longer delay to ensure page has time to load
    });
    
    sendResponse({ status: 'error', error: error.message });
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
    });
  });
}

/**
 * Update the localStorage in the web app tab
 */
function updateWebAppLocalStorage(screenshotData) {
  if (!editorTabId) {
    console.error('No editor tab ID available');
    return;
  }
  
  console.log('Updating localStorage in web app tab:', editorTabId);
  
  // We need to use executeScript with the correct permissions and format
  chrome.scripting.executeScript({
    target: { tabId: editorTabId },
    func: function(data) {
      try {
        console.log('Executing localStorage update in web app context');
        
        // Get existing screenshots from localStorage
        let screenshots = [];
        try {
          const storedData = localStorage.getItem('screenshots');
          if (storedData) {
            screenshots = JSON.parse(storedData);
            console.log(`Found ${screenshots.length} existing screenshots in localStorage`);
          } else {
            console.log('No existing screenshots in localStorage');
          }
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          // Reset to empty array if parsing fails
          screenshots = [];
        }
        
        // Ensure screenshots is an array
        if (!Array.isArray(screenshots)) {
          console.warn('Screenshots data is not an array, resetting');
          screenshots = [];
        }
        
        // Check if this screenshot already exists
        const exists = screenshots.some(s => s.id === data.id);
        
        if (!exists) {
          // Add new screenshot
          screenshots.push(data);
          
          // Save back to localStorage
          localStorage.setItem('screenshots', JSON.stringify(screenshots));
          
          // Dispatch a custom event to notify the app
          window.dispatchEvent(new CustomEvent('screenshotAdded', { 
            detail: data
          }));
          
          console.log('Screenshot added to web app localStorage, total count:', screenshots.length);
          return { success: true, message: 'Screenshot added' };
        } else {
          console.log('Screenshot already exists in localStorage, not adding duplicate');
          return { success: true, message: 'Screenshot already exists' };
        }
      } catch (error) {
        console.error('Error in localStorage update:', error);
        return { success: false, error: error.toString() };
      }
    },
    args: [screenshotData]
  }).then((results) => {
    const result = results && results[0] ? results[0].result : null;
    console.log('Script execution result:', result);
  }).catch(error => {
    console.error('Error executing script to update localStorage:', error);
  });
} 