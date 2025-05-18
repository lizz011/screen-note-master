import React, { useEffect, useState } from 'react';
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
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Load screenshots from localStorage
    const loadScreenshots = () => {
      try {
        const storedData = localStorage.getItem('screenshots');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          // Sort by timestamp (oldest first)
          const sorted = parsed.sort((a: ScreenshotData, b: ScreenshotData) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setScreenshots(sorted);
        }
      } catch (error) {
        console.error('Error loading screenshots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScreenshots();
  }, []);

  // When a specific ID is provided in the URL, scroll to that screenshot
  useEffect(() => {
    if (id && screenshots.length > 0) {
      const element = document.getElementById(id as string);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add highlighting effect
        element.classList.add('highlight');
        setTimeout(() => {
          element.classList.remove('highlight');
        }, 2000);
      }
    }
  }, [id, screenshots]);

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