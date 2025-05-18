import type { NextApiRequest, NextApiResponse } from 'next';

type Screenshot = {
  id: string;
  dataUrl: string;
  timestamp: string;
  notes: string;
  pageUrl?: string;
  pageTitle?: string;
};

// Create a global variable to store the latest screenshot
// This is a workaround for server-client communication
declare global {
  var latestScreenshot: Screenshot | null;
}

if (typeof global.latestScreenshot === 'undefined') {
  global.latestScreenshot = null;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle GET requests to retrieve the latest screenshot
  if (req.method === 'GET') {
    if (global.latestScreenshot) {
      res.status(200).json({ 
        success: true, 
        screenshot: global.latestScreenshot
      });
      // Clear after sending
      global.latestScreenshot = null;
    } else {
      res.status(404).json({ success: false, message: 'No screenshot available' });
    }
    return;
  }

  // Only accept POST requests for adding screenshots
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate the incoming data
    const screenshot = req.body as Screenshot;
    
    if (!screenshot || !screenshot.id || !screenshot.dataUrl || !screenshot.timestamp) {
      return res.status(400).json({ error: 'Invalid screenshot data' });
    }

    // Store the screenshot in the global variable for the client to retrieve
    global.latestScreenshot = screenshot;
    console.log('API received screenshot:', screenshot.id);
    
    // Return success with just the base URL, not a specific ID parameter
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?id=${screenshot.id}`;
    
    res.status(200).json({ 
      success: true, 
      message: 'Screenshot received successfully',
      viewUrl,
      screenshotId: screenshot.id
    });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    res.status(500).json({ error: 'Failed to process screenshot' });
  }
} 