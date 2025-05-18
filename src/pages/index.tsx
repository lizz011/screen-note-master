import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Screenshot from '../components/Screenshot';

interface ScreenshotData {
  id: string;
  dataUrl: string;
  timestamp: string;
  notes: string;
  pageUrl?: string;
  pageTitle?: string;
}

export default function Home() {
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScreenshotId, setNewScreenshotId] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  // Function to load screenshots from localStorage
  const loadScreenshots = useCallback(() => {
    console.log('Loading screenshots from localStorage');
    try {
      const storedData = localStorage.getItem('screenshots');
      console.log('Raw localStorage data:', storedData ? storedData.substring(0, 100) + '...' : 'null');
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        console.log('Parsed screenshots count:', parsed.length);
        
        // Sort by timestamp (oldest first)
        const sorted = parsed.sort((a: ScreenshotData, b: ScreenshotData) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setScreenshots(sorted);
        console.log('Loaded screenshots:', sorted.length);
      } else {
        console.log('No screenshots found in localStorage');
      }
    } catch (error) {
      console.error('Error loading screenshots:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadScreenshots();

    // Check if there's a new screenshot available from API
    const checkForNewScreenshot = async () => {
      try {
        const response = await fetch('/api/note');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.screenshot) {
            console.log('Retrieved new screenshot from API:', data.screenshot.id);
            
            // Add to localStorage
            const storedData = localStorage.getItem('screenshots');
            const screenshots = storedData ? JSON.parse(storedData) : [];
            
            // Check if it already exists
            if (!screenshots.some((s: ScreenshotData) => s.id === data.screenshot.id)) {
              screenshots.push(data.screenshot);
              localStorage.setItem('screenshots', JSON.stringify(screenshots));
              
              // Update state
              setScreenshots(screenshots);
              setNewScreenshotId(data.screenshot.id);
              console.log('Added new screenshot from API to localStorage');
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new screenshots:', error);
      }
    };
    
    // Check immediately on load
    checkForNewScreenshot();
    
    // Check periodically
    const intervalId = setInterval(checkForNewScreenshot, 3000);

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'screenshots') {
        console.log('localStorage changed, reloading screenshots');
        try {
          const newData = e.newValue ? JSON.parse(e.newValue) : [];
          setScreenshots(newData);
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          loadScreenshots();
        }
      }
    };
    
    // Listen for custom event from the browser extension
    const handleScreenshotAdded = (e: CustomEvent) => {
      console.log('Screenshot added event received', e.detail);
      try {
        // Get current screenshots
        const storedData = localStorage.getItem('screenshots');
        const currentScreenshots = storedData ? JSON.parse(storedData) : [];
        
        // Add new screenshot if it doesn't exist
        if (e.detail && !currentScreenshots.some((s: ScreenshotData) => s.id === e.detail.id)) {
          console.log('Adding new screenshot to state from event:', e.detail.id);
          currentScreenshots.push(e.detail);
          
          // Save to localStorage
          localStorage.setItem('screenshots', JSON.stringify(currentScreenshots));
          
          // Update state
          setScreenshots(currentScreenshots);
          
          // Set the new screenshot ID to trigger scrolling
          setNewScreenshotId(e.detail.id);
        } else {
          console.log('Screenshot already exists or no detail provided');
        }
      } catch (error) {
        console.error('Error handling new screenshot:', error);
        loadScreenshots();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('screenshotAdded', handleScreenshotAdded as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('screenshotAdded', handleScreenshotAdded as EventListener);
      clearInterval(intervalId);
    };
  }, [loadScreenshots]);

  // When a specific ID is provided in the URL or a new screenshot is added, scroll to that screenshot
  useEffect(() => {
    const targetId = id || newScreenshotId;
    
    if (targetId && screenshots.length > 0) {
      console.log('Scrolling to screenshot:', targetId);
      const element = document.getElementById(targetId as string);
      if (element) {
        // Add a slight delay to ensure the DOM is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add highlighting effect
          element.classList.add('highlight');
          setTimeout(() => {
            element.classList.remove('highlight');
          }, 2000);
          
          // Clear the new screenshot ID after scrolling
          if (newScreenshotId) {
            setNewScreenshotId(null);
          }
        }, 300);
      } else {
        console.log('Screenshot element not found:', targetId);
      }
    }
  }, [id, newScreenshotId, screenshots]);

  const handleSaveNotes = (id: string, notes: string) => {
    const updatedScreenshots = screenshots.map(screenshot => 
      screenshot.id === id ? { ...screenshot, notes } : screenshot
    );
    
    setScreenshots(updatedScreenshots);
    localStorage.setItem('screenshots', JSON.stringify(updatedScreenshots));
  };

  const handleExport = () => {
    if (screenshots.length === 0) {
      alert('No screenshots to export.');
      return;
    }
    
    let markdown = `# NoteShot Export\n\nExported on ${new Date().toLocaleString()}\n\n`;
    
    screenshots.forEach((screenshot) => {
      const timestamp = new Date(screenshot.timestamp).toLocaleString();
      const pageInfo = screenshot.pageTitle 
        ? `\nFrom: [${screenshot.pageTitle}](${screenshot.pageUrl})\n`
        : '';
      
      markdown += `## Screenshot - ${timestamp}${pageInfo}\n\n`;
      markdown += `![Screenshot](${screenshot.dataUrl})\n\n`;
      
      if (screenshot.notes && screenshot.notes.trim() !== '') {
        markdown += `${screenshot.notes}\n\n`;
      } else {
        markdown += `*No notes added for this screenshot.*\n\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteshot-export-${new Date().toISOString().slice(0, 10)}.md`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>NoteShot</title>
        <meta name="description" content="Take and annotate screenshots" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-blue-600">NoteShot</h1>
        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={screenshots.length === 0}
        >
          Export Markdown
        </button>
      </header>

      <main>
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading your screenshots...</p>
          </div>
        ) : screenshots.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <p className="text-gray-600 mb-2">No screenshots captured yet.</p>
            <p className="text-gray-500 text-sm">
              Use the NoteShot browser extension to capture screenshots.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {screenshots.map((screenshot) => (
              <Screenshot 
                key={screenshot.id}
                screenshot={screenshot}
                onSaveNotes={handleSaveNotes}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 