const express = require('express');
const axios = require('axios');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Configure axios instance with platform-specific headers
const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
  }
});

const PLATFORM_APIS = {
  CODEFORCES: 'https://codeforces.com/api/contest.list',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all?mode=all',
  LEETCODE: 'https://leetcode.com/contest/api/list/'
};

// Improved fetch function with platform validation
async function fetchPlatformData(platform) {
  const url = PLATFORM_APIS[platform];
  let attempts = 3;
  
  while (attempts > 0) {
    try {
      const response = await axiosInstance.get(url);
      
      // Platform-specific response validation
      if (platform === 'CODEFORCES' && response.data.status !== 'OK') {
        throw new Error('Codeforces API returned non-OK status');
      }
      if (platform === 'CODECHEF' && !response.data.future_contests) {
        throw new Error('Invalid CodeChef response structure');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      attempts--;
      if (attempts === 0) {
        console.error(`Failed to fetch ${platform}:`, error.message);
        return { success: false, data: null, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Main contests endpoint with improved error handling
app.get('/api/contests', async (req, res) => {
  try {
    const [codeforces, codechef, leetcode] = await Promise.all([
      fetchPlatformData('CODEFORCES'),
      fetchPlatformData('CODECHEF'),
      fetchPlatformData('LEETCODE')
    ]);

    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        codeforces: codeforces.data,
        codechef: codechef.data,
        leetcode: leetcode.data
      },
      errors: []
    };

    // Collect errors without failing the entire request
    [codeforces, codechef, leetcode].forEach((result, index) => {
      if (!result.success) {
        responseData.errors.push({
          platform: ['CODEFORCES', 'CODECHEF', 'LEETCODE'][index],
          message: result.error
        });
      }
    });

    res.status(responseData.errors.length === 3 ? 503 : 200).json(responseData);
  } catch (error) {
    console.error('Error in contests endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Export for Vercel serverless
const handler = serverless(app);
module.exports = {
  handler,
  app
};