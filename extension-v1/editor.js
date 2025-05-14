// Editor script for NoteShot Extension

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const screenshotsContainer = document.getElementById('screenshots-container');
  const exportBtn = document.getElementById('export-btn');
  const loadingMessage = document.getElementById('loading-message');
  
  // Add event listeners
  exportBtn.addEventListener('click', exportMarkdown);
  
  // Load and display screenshots
  loadScreenshots();
});

/**
 * Load screenshots from localStorage and display them
 */
function loadScreenshots() {
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    const screenshotsContainer = document.getElementById('screenshots-container');
    
    // Remove loading message
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
    
    if (screenshots.length === 0) {
      // Show message if no screenshots
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No screenshots captured yet. Use Ctrl+Shift+S to capture a screenshot.';
      screenshotsContainer.appendChild(emptyMessage);
      return;
    }
    
    // Sort screenshots by timestamp (newest first)
    screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create DOM elements for each screenshot
    screenshots.forEach((screenshot) => {
      const screenshotElement = createScreenshotElement(screenshot);
      screenshotsContainer.appendChild(screenshotElement);
    });
  });
}

/**
 * Create a DOM element for a screenshot
 */
function createScreenshotElement(screenshot) {
  // Create container
  const container = document.createElement('div');
  container.className = 'screenshot-container';
  container.id = screenshot.id;
  
  // Create image element
  const img = document.createElement('img');
  img.className = 'screenshot-image';
  img.src = screenshot.dataUrl;
  img.alt = `Screenshot taken on ${new Date(screenshot.timestamp).toLocaleString()}`;
  
  // Create notes container
  const notesContainer = document.createElement('div');
  notesContainer.className = 'markdown-container';
  
  // Create textarea for notes
  const textarea = document.createElement('textarea');
  textarea.className = 'markdown-editor';
  textarea.placeholder = 'Write your notes here (Markdown supported)...';
  textarea.value = screenshot.notes || '';
  
  // Add event listener to save notes
  textarea.addEventListener('input', () => {
    saveNotes(screenshot.id, textarea.value);
  });
  
  // Append elements to container
  notesContainer.appendChild(textarea);
  container.appendChild(img);
  container.appendChild(notesContainer);
  
  return container;
}

/**
 * Save notes for a screenshot
 */
function saveNotes(id, notes) {
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    
    // Find the screenshot with the matching ID
    const index = screenshots.findIndex(s => s.id === id);
    
    if (index !== -1) {
      // Update notes
      screenshots[index].notes = notes;
      
      // Save back to storage
      chrome.storage.local.set({ screenshots: screenshots }, () => {
        console.log('Notes saved for', id);
      });
    }
  });
}

/**
 * Export all screenshots and notes as Markdown
 */
function exportMarkdown() {
  chrome.storage.local.get(['screenshots'], (result) => {
    const screenshots = result.screenshots || [];
    
    if (screenshots.length === 0) {
      alert('No screenshots to export.');
      return;
    }
    
    // Sort screenshots by timestamp (oldest first for the export)
    screenshots.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Create Markdown content
    let markdown = `# NoteShot Export\n\nExported on ${new Date().toLocaleString()}\n\n`;
    
    // Add each screenshot and its notes
    screenshots.forEach((screenshot) => {
      const timestamp = new Date(screenshot.timestamp).toLocaleString();
      markdown += `## Screenshot - ${timestamp}\n\n`;
      markdown += `![Screenshot](${screenshot.dataUrl})\n\n`;
      
      if (screenshot.notes && screenshot.notes.trim() !== '') {
        markdown += `${screenshot.notes}\n\n`;
      } else {
        markdown += `*No notes added for this screenshot.*\n\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    // Create a Blob with the Markdown content
    const blob = new Blob([markdown], { type: 'text/markdown' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteshot-export-${new Date().toISOString().slice(0, 10)}.md`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
} 