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
    
    // Return success with just the base URL, not a specific ID parameter
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;
    
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