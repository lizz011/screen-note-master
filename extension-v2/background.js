// Background script for OCR Subtitle Recognition Extension

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  if (command === 'capture-subtitle') {
    // When shortcut is pressed, send message to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Check if this is the first time use
      chrome.storage.local.get(['subtitleRegion'], (result) => {
        if (result.subtitleRegion) {
          // If region is already set, capture it directly
          chrome.tabs.sendMessage(activeTab.id, { 
            action: 'captureSubtitleRegion',
            region: result.subtitleRegion
          });
        } else {
          // If region isn't set, prompt user to select a region
          chrome.tabs.sendMessage(activeTab.id, { 
            action: 'selectSubtitleRegion' 
          });
        }
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
  
  // When a region is saved
  if (message.action === 'saveRegion') {
    chrome.storage.local.set({ subtitleRegion: message.region }, () => {
      console.log('Subtitle region saved:', message.region);
      sendResponse({ status: 'success' });
    });
    return true; // Indicates async response
  }
  
  // When a screenshot is captured
  if (message.action === 'screenshotCaptured') {
    // Store the screenshot temporarily
    chrome.storage.local.set({ lastScreenshot: message.dataUrl }, () => {
      console.log('Screenshot saved');
      sendResponse({ status: 'success' });
    });
    return true; // Indicates async response
  }
}); 