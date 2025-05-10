// Popup script for OCR Subtitle Recognition Extension

document.addEventListener('DOMContentLoaded', () => {
  // Get UI elements
  const captureBtn = document.getElementById('capture-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusMessage = document.getElementById('status-message');
  const previewImage = document.getElementById('preview-image');
  const textResult = document.getElementById('text-result');
  
  // Check if there's a saved region
  checkSavedRegion();
  
  // Check if there's a last screenshot
  checkLastScreenshot();
  
  // Add event listeners
  captureBtn.addEventListener('click', captureSubtitles);
  resetBtn.addEventListener('click', resetRegion);
  
  // Function to check if there's a saved region
  function checkSavedRegion() {
    chrome.storage.local.get(['subtitleRegion'], (result) => {
      if (result.subtitleRegion) {
        const region = result.subtitleRegion;
        statusMessage.textContent = `Region set: ${region.width}x${region.height} at (${region.x}, ${region.y})`;
      } else {
        statusMessage.textContent = 'No region set. Press Ctrl+Shift+S or capture button to select a region.';
      }
    });
  }
  
  // Function to check if there's a last screenshot
  function checkLastScreenshot() {
    chrome.storage.local.get(['lastScreenshot'], (result) => {
      if (result.lastScreenshot) {
        // Show the screenshot preview
        previewImage.src = result.lastScreenshot;
        previewImage.style.display = 'block';
        
        // Show placeholder message for OCR text
        // In a real implementation, this would be replaced with the OCR result
        textResult.innerHTML = '<p>OCR processing will be implemented in feature 5.2</p>';
      }
    });
  }
  
  // Function to trigger subtitle capture
  function captureSubtitles() {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Check if a region is already set
      chrome.storage.local.get(['subtitleRegion'], (result) => {
        if (result.subtitleRegion) {
          // If region is set, capture it
          chrome.tabs.sendMessage(activeTab.id, {
            action: 'captureSubtitleRegion',
            region: result.subtitleRegion
          }, (response) => {
            if (chrome.runtime.lastError) {
              // Handle error - content script might not be loaded
              statusMessage.textContent = 'Error: Please refresh the page and try again.';
            } else if (response && response.status === 'capturing') {
              statusMessage.textContent = 'Capturing subtitle area...';
              
              // Close popup to avoid UI interference
              // But give time for message to be seen
              setTimeout(() => {
                window.close();
              }, 750);
            }
          });
        } else {
          // If region isn't set, prompt selection
          chrome.tabs.sendMessage(activeTab.id, {
            action: 'selectSubtitleRegion'
          }, (response) => {
            if (chrome.runtime.lastError) {
              // Handle error - content script might not be loaded
              statusMessage.textContent = 'Error: Please refresh the page and try again.';
            } else if (response && response.status === 'selecting') {
              statusMessage.textContent = 'Please select the subtitle area...';
              
              // Close popup to avoid UI interference
              setTimeout(() => {
                window.close();
              }, 750);
            }
          });
        }
      });
    });
  }
  
  // Function to reset the saved region
  function resetRegion() {
    chrome.storage.local.remove(['subtitleRegion', 'lastScreenshot'], () => {
      statusMessage.textContent = 'Region reset. Press Ctrl+Shift+S or capture button to select a new region.';
      
      // Clear the preview
      previewImage.style.display = 'none';
      textResult.innerHTML = '<p class="no-result">Captured text will appear here</p>';
    });
  }
}); 