import type { NextApiRequest, NextApiResponse } from 'next';

type Screenshot = {
  id: string;
  dataUrl: string;
  timestamp: string;
  notes: string;
  pageUrl?: string;
  pageTitle?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate the incoming data
    const screenshot = req.body as Screenshot;
    
    if (!screenshot || !screenshot.id || !screenshot.dataUrl || !screenshot.timestamp) {
      return res.status(400).json({ error: 'Invalid screenshot data' });
    }

    // In a real implementation, this would save to a database
    // For this MVP, we'll just respond with a success message and URL
    // The actual storage happens client-side in localStorage
    
    // Return success with a URL to view the screenshot
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?id=${screenshot.id}`;
    
    res.status(200).json({ 
      success: true, 
      message: 'Screenshot received successfully',
      viewUrl 
    });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    res.status(500).json({ error: 'Failed to process screenshot' });
  }
} 