import React, { useState, useEffect } from 'react';

interface ScreenshotProps {
  screenshot: {
    id: string;
    dataUrl: string;
    timestamp: string;
    notes: string;
    pageUrl?: string;
    pageTitle?: string;
  };
  onSaveNotes: (id: string, notes: string) => void;
}

const Screenshot: React.FC<ScreenshotProps> = ({ screenshot, onSaveNotes }) => {
  const [notes, setNotes] = useState(screenshot.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Format the timestamp for display
  const formattedDate = new Date(screenshot.timestamp).toLocaleString();

  // Save notes when user stops typing after 1 second
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes !== screenshot.notes) {
        onSaveNotes(screenshot.id, notes);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [notes, screenshot.id, screenshot.notes, onSaveNotes]);

  return (
    <div 
      id={screenshot.id} 
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Screenshot metadata */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Captured on: {formattedDate}</span>
          {screenshot.pageTitle && (
            <a 
              href={screenshot.pageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate ml-4"
            >
              {screenshot.pageTitle}
            </a>
          )}
        </div>
      </div>
      
      {/* Screenshot image */}
      <div className="bg-gray-100 border-b">
        <img 
          src={screenshot.dataUrl} 
          alt={`Screenshot taken on ${formattedDate}`}
          className="max-w-full h-auto mx-auto"
        />
      </div>
      
      {/* Notes section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800">Notes</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        </div>
        
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes here (Markdown supported)..."
            className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md"
          />
        ) : (
          <div className="markdown-preview p-3 border border-gray-200 rounded-md min-h-[150px] bg-white">
            {notes ? (
              <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(notes) }} />
            ) : (
              <p className="text-gray-400 italic">No notes added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple markdown to HTML converter (for demonstration)
// In a real app, you would use a proper markdown library like marked or remark
function convertMarkdownToHtml(markdown: string) {
  if (!markdown) return '';
  
  // This is a very basic implementation - replace with a proper markdown library
  return markdown
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Lists
    .replace(/^\s*\n\*/gm, '<ul>\n*')
    .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2')
    .replace(/^\*(.+)/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/^\s*\n\s*\n/gm, '</p><p>')
    .replace(/^\s*(.+)/gm, '$1<br>');
}

export default Screenshot; 