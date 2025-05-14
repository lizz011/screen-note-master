// Popup script for OCR Subtitle Recognition Extension

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Get UI elements
  const captureBtn = document.getElementById('capture-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusMessage = document.getElementById('status-message');
  const previewImage = document.getElementById('preview-image');
  const textResult = document.getElementById('text-result');
  
  // Initialize the popup
  initPopup();
  
  function initPopup() {
    // Check if there's a saved region
    checkSavedRegion();
    
    // Check if there's a last screenshot
    checkLastScreenshot();
    
    // Add event listeners
    captureBtn.addEventListener('click', captureSubtitles);
    resetBtn.addEventListener('click', resetRegion);
  }
  
  // Function to check if there's a saved region
  function checkSavedRegion() {
    chrome.storage.local.get(['subtitleRegion'], (result) => {
      if (result.subtitleRegion) {
        const region = result.subtitleRegion;
        statusMessage.textContent = `Region set: ${region.width}x${region.height} at (${region.x}, ${region.y})`;
        statusMessage.style.backgroundColor = '#dcfce7'; // Light green background
        statusMessage.style.color = '#166534'; // Dark green text
      } else {
        statusMessage.textContent = 'No region set. Press Ctrl+Shift+S or capture button to select a region.';
        statusMessage.style.backgroundColor = '#fee2e2'; // Light red background
        statusMessage.style.color = '#9b1c1c'; // Dark red text
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
        
        // Check if the image is all black or just a placeholder
        checkIfImageIsPlaceholder(result.lastScreenshot, (isPlaceholder) => {
          if (isPlaceholder) {
            textResult.innerHTML = '<p style="padding: 10px; color: #e11d48;">The captured image appears to be a placeholder. The extension may not have proper permissions to capture the screen content. Try refreshing the page and capturing again.</p>';
          } else {
            // Show placeholder message for OCR text
            textResult.innerHTML = '<p style="padding: 10px;">OCR processing will be implemented in feature 5.2</p>';
          }
        });
      }
    });
  }
  
  // Helper function to check if an image is mostly black (a placeholder)
  function checkIfImageIsPlaceholder(dataUrl, callback) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Count dark pixels
      let darkPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        // Check if pixel is very dark
        if (data[i] < 30 && data[i+1] < 30 && data[i+2] < 30) {
          darkPixels++;
        }
      }
      
      // If more than 80% of pixels are dark, it's likely a placeholder
      const isPlaceholder = (darkPixels / totalPixels) > 0.8;
      callback(isPlaceholder);
    };
    
    img.onerror = function() {
      callback(true); // Assume it's a placeholder if we can't load it
    };
    
    img.src = dataUrl;
  }
  
  // Function to trigger subtitle capture
  function captureSubtitles() {
    console.log('Capture button clicked');
    
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
              showError('Error: Please refresh the page and try again.');
            } else if (response && response.status === 'capturing') {
              updateStatus('Capturing subtitle area...', 'info');
              
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
              showError('Error: Please refresh the page and try again.');
            } else if (response && response.status === 'selecting') {
              updateStatus('Please select the subtitle area...', 'info');
              
              // Close popup to avoid UI interference
              setTimeout(() => {
                window.close();
              }, 750);
            } else if (response && response.status === 'already_selecting') {
              updateStatus('Selection already in progress, please complete it.', 'warning');
            }
          });
        }
      });
    });
  }
  
  // Function to reset the saved region
  function resetRegion() {
    console.log('Reset button clicked');
    chrome.storage.local.remove(['subtitleRegion', 'lastScreenshot'], () => {
      updateStatus('Region reset. Press Ctrl+Shift+S or capture button to select a new region.', 'warning');
      
      // Clear the preview
      previewImage.style.display = 'none';
      textResult.innerHTML = '<p class="no-result">Captured text will appear here</p>';
    });
  }
  
  // Helper function to show errors
  function showError(message) {
    updateStatus(message, 'error');
  }
  
  // Helper function to update status with type (info, warning, error)
  function updateStatus(message, type) {
    statusMessage.textContent = message;
    
    // Reset styles
    statusMessage.style.backgroundColor = '';
    statusMessage.style.color = '';
    
    // Apply appropriate styling based on message type
    switch(type) {
      case 'info':
        statusMessage.style.backgroundColor = '#e0f2fe'; // Light blue
        statusMessage.style.color = '#0c4a6e'; // Dark blue
        break;
      case 'warning':
        statusMessage.style.backgroundColor = '#fef3c7'; // Light yellow
        statusMessage.style.color = '#92400e'; // Dark yellow/orange
        break;
      case 'error':
        statusMessage.style.backgroundColor = '#fee2e2'; // Light red
        statusMessage.style.color = '#9b1c1c'; // Dark red
        break;
      default:
        // Default styling from CSS
        break;
    }
  }
}); 