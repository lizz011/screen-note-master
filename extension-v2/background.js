// Background script for NoteShot Extension

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
  
  // When a screenshot is captured
  if (message.action === 'screenshotCaptured') {
    // Store the screenshot in localStorage
    const timestamp = new Date().toISOString();
    const screenshotData = {
      id: `screenshot_${timestamp}`,
      dataUrl: message.dataUrl,
      timestamp: timestamp,
      notes: ""
    };

    // Get existing screenshots array or create empty one
    chrome.storage.local.get(['screenshots'], (result) => {
      const screenshots = result.screenshots || [];
      screenshots.push(screenshotData);
      
      // Save updated screenshots array
      chrome.storage.local.set({ screenshots: screenshots }, () => {
        console.log('Screenshot saved to storage');
        
        // Check if editor page is already open
        chrome.tabs.query({url: chrome.runtime.getURL("editor.html")}, (tabs) => {
          if (tabs.length > 0) {
            // Editor page exists, refresh it
            chrome.tabs.reload(tabs[0].id);
            // Focus on the editor tab
            chrome.tabs.update(tabs[0].id, {active: true});
          } else {
            // No editor page exists, create a new one
            chrome.tabs.create({ url: 'editor.html' });
          }
          
          sendResponse({ status: 'success' });
        });
      });
    });
    
    return true; // Indicates async response
  }
}); 