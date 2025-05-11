// Content script for OCR Subtitle Recognition Extension - V2

/**
 * Global state variables
 */
const state = {
  isSelecting: false,
  isSelectionActive: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
};

/**
 * DOM Elements
 */
let elements = {
  overlay: null,
  selection: null,
  instructions: null
};

/**
 * Initialize the event listeners
 */
init();

function init() {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    if (message.action === 'selectSubtitleRegion') {
      if (!state.isSelectionActive) {
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
}

/**
 * Start the region selection process
 */
function startRegionSelection() {
  console.log('Starting region selection');
  state.isSelectionActive = true;
  
  // Create and append the overlay
  elements.overlay = createOverlay();
  document.body.appendChild(elements.overlay);
  
  // Create and append the selection rectangle
  elements.selection = createSelectionElement();
  document.body.appendChild(elements.selection);
  
  // Create and append instructions
  elements.instructions = createInstructionsElement();
  document.body.appendChild(elements.instructions);
  
  // Add mouse event listeners to the overlay
  elements.overlay.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // Add keyboard event listener for ESC key
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Create the overlay element
 */
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'ocr-subtitle-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  overlay.style.zIndex = '2147483646';
  overlay.style.cursor = 'crosshair';
  return overlay;
}

/**
 * Create the selection rectangle element
 */
function createSelectionElement() {
  const selection = document.createElement('div');
  selection.id = 'ocr-subtitle-selection';
  selection.style.position = 'fixed';
  selection.style.border = '3px dashed #fff';
  selection.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
  selection.style.display = 'none';
  selection.style.zIndex = '2147483647';
  return selection;
}

/**
 * Create the instructions element
 */
function createInstructionsElement() {
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
  instructions.style.zIndex = '2147483648';
  instructions.textContent = 'Select the subtitle area by clicking and dragging, then RELEASE to confirm';
  instructions.style.fontWeight = 'bold';
  return instructions;
}

/**
 * Handle mousedown event
 */
function handleMouseDown(e) {
  console.log('Mouse down event triggered');
  state.isSelecting = true;
  state.startX = e.clientX;
  state.startY = e.clientY;
  state.currentX = e.clientX;
  state.currentY = e.clientY;
  
  elements.selection.style.display = 'block';
  updateSelectionElement();
  
  // Prevent default behavior
  e.preventDefault();
}

/**
 * Handle mousemove event
 */
function handleMouseMove(e) {
  if (!state.isSelecting) return;
  
  state.currentX = e.clientX;
  state.currentY = e.clientY;
  updateSelectionElement();
  
  // Prevent default behavior
  e.preventDefault();
}

/**
 * Handle mouseup event
 */
function handleMouseUp(e) {
  console.log('Mouse up event triggered');
  
  if (!state.isSelecting) return;
  
  state.isSelecting = false;
  state.currentX = e.clientX;
  state.currentY = e.clientY;
  
  // Calculate the final region
  const region = calculateRegion();
  
  // Only proceed if the region is large enough
  if (region.width > 10 && region.height > 10) {
    // Clean up the UI elements
    cleanupSelectionUI();
    
    // Save the selected region
    saveRegion(region);
    
    // Capture screenshot of the region
    captureRegion(region);
    
    console.log('Region selected:', region);
  } else {
    // If the selection is too small, show an error message
    showErrorMessage('Selection too small. Please try again.');
  }
  
  // Prevent default behavior
  e.preventDefault();
}

/**
 * Handle keydown event (for ESC key)
 */
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    console.log('Escape key pressed, canceling selection');
    cleanupSelectionUI();
    
    // Prevent default behavior
    e.preventDefault();
  }
}

/**
 * Update the selection element based on current mouse position
 */
function updateSelectionElement() {
  const left = Math.min(state.startX, state.currentX);
  const top = Math.min(state.startY, state.currentY);
  const width = Math.abs(state.currentX - state.startX);
  const height = Math.abs(state.currentY - state.startY);
  
  elements.selection.style.left = left + 'px';
  elements.selection.style.top = top + 'px';
  elements.selection.style.width = width + 'px';
  elements.selection.style.height = height + 'px';
}

/**
 * Calculate the selected region coordinates and dimensions
 */
function calculateRegion() {
  return {
    x: Math.min(state.startX, state.currentX),
    y: Math.min(state.startY, state.currentY),
    width: Math.abs(state.currentX - state.startX),
    height: Math.abs(state.currentY - state.startY)
  };
}

/**
 * Clean up the selection UI elements
 */
function cleanupSelectionUI() {
  console.log('Cleaning up selection UI');
  
  // Remove event listeners
  if (elements.overlay) {
    elements.overlay.removeEventListener('mousedown', handleMouseDown);
  }
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('keydown', handleKeyDown);
  
  // Remove UI elements if they exist
  if (elements.overlay && document.body.contains(elements.overlay)) {
    document.body.removeChild(elements.overlay);
  }
  
  if (elements.instructions && document.body.contains(elements.instructions)) {
    document.body.removeChild(elements.instructions);
  }
  
  if (elements.selection && document.body.contains(elements.selection)) {
    document.body.removeChild(elements.selection);
  }
  
  // Reset the selection state
  state.isSelectionActive = false;
  elements = { overlay: null, selection: null, instructions: null };
}

/**
 * Show error message
 */
function showErrorMessage(message) {
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
  errorMsg.textContent = message;
  document.body.appendChild(errorMsg);
  
  // Remove error message after 2 seconds
  setTimeout(() => {
    if (document.body.contains(errorMsg)) {
      document.body.removeChild(errorMsg);
    }
  }, 2000);
}

/**
 * Save the selected region
 */
function saveRegion(region) {
  chrome.runtime.sendMessage({
    action: 'saveRegion',
    region: region
  });
}

/**
 * Capture the region
 */
function captureRegion(region) {
  console.log('Capturing region:', region);
  
  // Create a viewfinder to show where we're capturing
  const viewfinder = document.createElement('div');
  viewfinder.style.position = 'fixed';
  viewfinder.style.left = region.x + 'px';
  viewfinder.style.top = region.y + 'px';
  viewfinder.style.width = region.width + 'px';
  viewfinder.style.height = region.height + 'px';
  viewfinder.style.zIndex = '2147483645';
  viewfinder.style.pointerEvents = 'none';
  viewfinder.style.border = '2px solid red';
  document.body.appendChild(viewfinder);
  
  // We'll use a combination of approaches:
  // 1. First try using chrome.tabs.captureVisibleTab through a message to background script
  // 2. If that fails, we'll use html2canvas as a fallback to capture content from the DOM

  // Send message to background script to capture the visible tab
  chrome.runtime.sendMessage({
    action: 'captureVisibleTab'
  }, (response) => {
    if (chrome.runtime.lastError || !response || !response.dataUrl) {
      console.error('Error with captureVisibleTab, falling back to canvas:', 
                   chrome.runtime.lastError);
      // Fall back to DOM-based capture
      captureUsingCanvas(region, viewfinder);
    } else {
      processScreenshot(response.dataUrl, region, viewfinder);
    }
  });

  // Function to process the screenshot from captureVisibleTab
  function processScreenshot(dataUrl, region, viewfinder) {
    try {
      // Create an image element to load the screenshot
      const img = new Image();
      
      img.onload = function() {
        // Create a canvas to crop the region
        const canvas = document.createElement('canvas');
        canvas.width = region.width;
        canvas.height = region.height;
        
        const ctx = canvas.getContext('2d');
        
        // Crop the region
        ctx.drawImage(
          img,
          region.x, region.y, region.width, region.height,  // Source rectangle
          0, 0, region.width, region.height                 // Destination rectangle
        );
        
        // Convert to data URL
        const croppedDataUrl = canvas.toDataURL('image/png');
        
        // Send the cropped screenshot to background script
        chrome.runtime.sendMessage({
          action: 'screenshotCaptured',
          dataUrl: croppedDataUrl
        });
        
        // Clean up viewfinder
        if (document.body.contains(viewfinder)) {
          document.body.removeChild(viewfinder);
        }
        
        // Show success notification
        showCaptureNotification(region);
      };
      
      img.onerror = function() {
        console.error('Error loading screenshot image');
        captureUsingCanvas(region, viewfinder);
      };
      
      // Set the image source to the screenshot data URL
      img.src = dataUrl;
      
    } catch (error) {
      console.error('Error processing screenshot:', error);
      captureUsingCanvas(region, viewfinder);
    }
  }
  
  // Function to capture using canvas as a fallback
  function captureUsingCanvas(region, viewfinder) {
    // Get the element at the center of the region
    const centerX = region.x + region.width / 2;
    const centerY = region.y + region.height / 2;
    const elementAtCenter = document.elementFromPoint(centerX, centerY);
    
    // Try to find the video element
    let videoElement = null;
    if (elementAtCenter && elementAtCenter.tagName === 'VIDEO') {
      videoElement = elementAtCenter;
    } else {
      // Look for a video element within the target area
      const videos = document.querySelectorAll('video');
      for (const video of videos) {
        const rect = video.getBoundingClientRect();
        if (
          rect.left <= region.x + region.width &&
          rect.right >= region.x &&
          rect.top <= region.y + region.height &&
          rect.bottom >= region.y
        ) {
          videoElement = video;
          break;
        }
      }
    }
    
    // Create a canvas for the capture
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext('2d');
    
    // If we found a video element, capture from it
    if (videoElement) {
      try {
        // Calculate the portion of the video to capture
        const videoRect = videoElement.getBoundingClientRect();
        const sourceX = Math.max(0, region.x - videoRect.left);
        const sourceY = Math.max(0, region.y - videoRect.top);
        
        // Draw the video content onto the canvas
        ctx.drawImage(
          videoElement,
          sourceX, sourceY, region.width, region.height,  // Source rectangle
          0, 0, region.width, region.height              // Destination rectangle
        );
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Send the captured screenshot to background script
        chrome.runtime.sendMessage({
          action: 'screenshotCaptured',
          dataUrl: dataUrl
        });
        
      } catch (error) {
        console.error('Error capturing video element:', error);
        // Fall back to a visual placeholder with DOM content
        captureVisualPlaceholder(ctx, region);
      }
    } else {
      // If we couldn't find a video, try to capture the DOM content visually
      captureVisualPlaceholder(ctx, region);
    }
    
    // Clean up and show notification regardless of capture method
    if (document.body.contains(viewfinder)) {
      document.body.removeChild(viewfinder);
    }
    
    // Show a temporary notification that the capture was successful
    showCaptureNotification(region);
  }
  
  // Function to create a visual placeholder with some DOM content
  function captureVisualPlaceholder(ctx, region) {
    // Fill with a light gray background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, region.width, region.height);
    
    // Try to render some text from the region
    try {
      // Get all text nodes in the region
      const elements = document.elementsFromPoint(
        region.x + region.width / 2, 
        region.y + region.height / 2
      );
      
      let textContent = '';
      for (const element of elements) {
        // Skip invisible elements
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        
        // Get text content
        const elText = element.textContent?.trim();
        if (elText) {
          textContent = elText;
          break;
        }
      }
      
      // If we found text, draw it
      if (textContent) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        // Wrap text if needed
        const words = textContent.split(' ');
        let line = '';
        let y = region.height / 2 - 20;
        const lineHeight = 20;
        const maxWidth = region.width - 20;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, region.width / 2, y);
            line = words[i] + ' ';
            y += lineHeight;
            
            // Limit to 3 lines
            if (y > region.height / 2 + 20) break;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, region.width / 2, y);
      } else {
        // Default text if no content found
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Subtitle Content (DOM Capture)', region.width / 2, region.height / 2);
      }
      
    } catch (error) {
      console.error('Error creating visual placeholder:', error);
      // Fallback message
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Subtitle Area', region.width / 2, region.height / 2);
    }
    
    // Send the canvas data
    chrome.runtime.sendMessage({
      action: 'screenshotCaptured',
      dataUrl: canvas.toDataURL('image/png')
    });
  }
}

/**
 * Show capture notification
 */
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
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 2000);
} 