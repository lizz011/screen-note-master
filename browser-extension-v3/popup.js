// Popup script for the NoteShot extension

document.addEventListener('DOMContentLoaded', function() {
  // Get the button element
  const captureBtn = document.getElementById('captureBtn');
  
  // Add click event listener
  captureBtn.addEventListener('click', function() {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        
        // Send message to content script to capture screenshot
        chrome.tabs.sendMessage(activeTab.id, { action: 'captureScreenshot' });
        
        // Close the popup
        window.close();
      }
    });
  });
}); 