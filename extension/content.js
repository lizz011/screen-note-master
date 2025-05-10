// Content script for OCR Subtitle Recognition Extension

// Variables to store selection state
let isSelecting = false;
let startX, startY, currentX, currentY;
let selectionElement = null;
let isSelectionActive = false; // Track if selection overlay is active

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'selectSubtitleRegion') {
    // Only start selection if not already active
    if (!isSelectionActive) {
      startRegionSelection();
      sendResponse({ status: 'selecting' });
    } else {
      sendResponse({ status: 'already_selecting' });
    }
  }
  
  if (message.action === 'captureSubtitleRegion') {
    captureRegion(message.region);
    sendResponse({ status: 'capturing' });
  }
  
  return true; // Indicates async response
});

// Function to start region selection
function startRegionSelection() {
  isSelectionActive = true; // Mark selection as active
  
  // Create overlay for selection
  const overlay = document.createElement('div');
  overlay.id = 'ocr-subtitle-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  overlay.style.zIndex = '2147483647';
  overlay.style.cursor = 'crosshair';
  document.body.appendChild(overlay);
  
  // Create selection element
  selectionElement = document.createElement('div');
  selectionElement.id = 'ocr-subtitle-selection';
  selectionElement.style.position = 'fixed';
  selectionElement.style.border = '2px dashed #fff';
  selectionElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
  selectionElement.style.display = 'none';
  selectionElement.style.zIndex = '2147483648';
  document.body.appendChild(selectionElement);
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.id = 'ocr-subtitle-instructions';
  instructions.style.position = 'fixed';
  instructions.style.top = '20px';
  instructions.style.left = '50%';
  instructions.style.transform = 'translateX(-50%)';
  instructions.style.padding = '10px 20px';
  instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructions.style.color = 'white';
  instructions.style.borderRadius = '5px';
  instructions.style.fontFamily = 'Arial, sans-serif';
  instructions.style.zIndex = '2147483649';
  instructions.textContent = 'Select the subtitle area by clicking and dragging, then release to confirm';
  document.body.appendChild(instructions);
  
  // Mouse event handlers
  overlay.addEventListener('mousedown', handleMouseDown);
  overlay.addEventListener('mousemove', handleMouseMove);
  overlay.addEventListener('mouseup', handleMouseUp);
  
  // Also add ESC key handler to cancel selection
  document.addEventListener('keydown', handleKeyDown);
  
  function handleMouseDown(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;
    selectionElement.style.display = 'block';
    updateSelectionElement();
  }
  
  function handleMouseMove(e) {
    if (!isSelecting) return;
    currentX = e.clientX;
    currentY = e.clientY;
    updateSelectionElement();
  }
  
  function handleMouseUp(e) {
    if (!isSelecting) return;
    isSelecting = false;
    
    // Calculate the selected region
    const region = calculateRegion();
    
    // Only proceed if the selected area is valid (not too small)
    if (region.width > 10 && region.height > 10) {
      cleanupSelectionUI();
      
      // Save the selected region
      saveRegion(region);
      
      // Capture screenshot of the region
      captureRegion(region);
    } else {
      // If selection is too small, show error message
      const errorMsg = document.createElement('div');
      errorMsg.style.position = 'fixed';
      errorMsg.style.top = '80px';
      errorMsg.style.left = '50%';
      errorMsg.style.transform = 'translateX(-50%)';
      errorMsg.style.padding = '10px 20px';
      errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      errorMsg.style.color = 'white';
      errorMsg.style.borderRadius = '5px';
      errorMsg.style.fontFamily = 'Arial, sans-serif';
      errorMsg.style.zIndex = '2147483649';
      errorMsg.textContent = 'Selection too small, please try again';
      document.body.appendChild(errorMsg);
      
      // Remove error message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(errorMsg);
      }, 2000);
    }
  }
  
  function handleKeyDown(e) {
    // ESC key to cancel selection
    if (e.key === 'Escape') {
      cleanupSelectionUI();
    }
  }
  
  function cleanupSelectionUI() {
    // Remove event listeners
    overlay.removeEventListener('mousedown', handleMouseDown);
    overlay.removeEventListener('mousemove', handleMouseMove);
    overlay.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
    
    // Remove UI elements
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    if (document.body.contains(instructions)) document.body.removeChild(instructions);
    if (document.body.contains(selectionElement)) document.body.removeChild(selectionElement);
    
    // Reset selection state
    isSelectionActive = false;
  }
  
  function updateSelectionElement() {
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionElement.style.left = left + 'px';
    selectionElement.style.top = top + 'px';
    selectionElement.style.width = width + 'px';
    selectionElement.style.height = height + 'px';
  }
  
  function calculateRegion() {
    return {
      x: Math.min(startX, currentX),
      y: Math.min(startY, currentY),
      width: Math.abs(currentX - startX),
      height: Math.abs(currentY - startY)
    };
  }
}

// Function to save the selected region
function saveRegion(region) {
  chrome.runtime.sendMessage({
    action: 'saveRegion',
    region: region
  });
}

// Function to capture screenshot of a specific region
function captureRegion(region) {
  // Create canvas for capturing
  const canvas = document.createElement('canvas');
  canvas.width = region.width;
  canvas.height = region.height;
  
  const ctx = canvas.getContext('2d');
  
  // Use html2canvas or similar approach
  // For this example, we'll take a screenshot of the visible viewport
  // In a real implementation, you might need to use browser.tabs.captureVisibleTab
  // or another approach
  
  // This is a simplified capture approach
  // It works by creating a temporary high-z-index element over the region
  // and using the canvas to capture what's visible in that region
  
  // Create a "viewfinder" element
  const viewfinder = document.createElement('div');
  viewfinder.style.position = 'fixed';
  viewfinder.style.left = region.x + 'px';
  viewfinder.style.top = region.y + 'px';
  viewfinder.style.width = region.width + 'px';
  viewfinder.style.height = region.height + 'px';
  viewfinder.style.zIndex = '2147483646';
  viewfinder.style.pointerEvents = 'none';
  document.body.appendChild(viewfinder);
  
  // Use setTimeout to allow browser to render the viewfinder
  setTimeout(() => {
    try {
      // This is where you would normally use getDisplayMedia or other screen capture API
      // But for this simplified example, we'll create a placeholder image
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, region.width, region.height);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('Subtitle Area', 10, region.height / 2);
      
      // Convert canvas to base64 image data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Send the captured screenshot to background script
      chrome.runtime.sendMessage({
        action: 'screenshotCaptured',
        dataUrl: dataUrl
      });
      
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      // Clean up
      document.body.removeChild(viewfinder);
      
      // Show a temporary notification that the capture was successful
      showCaptureNotification(region);
    }
  }, 100);
}

// Show a temporary notification that the capture was successful
function showCaptureNotification(region) {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.left = region.x + 'px';
  notification.style.top = (region.y - 40) + 'px';
  notification.style.padding = '8px 16px';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.zIndex = '2147483649';
  notification.textContent = 'Subtitle area captured!';
  document.body.appendChild(notification);
  
  // Remove the notification after 2 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
} 