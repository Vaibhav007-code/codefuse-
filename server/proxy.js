// server/proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// CORS configuration is handled by Vercel.json, but we'll keep this for local development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    credentials: true
  }));
}

// Configure axios instance with timeout and retries
const axiosInstance = axios.create({
  timeout: 8000, // 8 seconds timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const PLATFORM_APIS = {
  CODEFORCES: 'https://codeforces.com/api/contest.list',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all',
  LEETCODE: 'https://leetcode.com/contest/api/list/'
};

// Helper function to fetch with timeout and retry
async function fetchWithRetry(platform, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axiosInstance.get(PLATFORM_APIS[platform]);
      return { success: true, data: response.data };
    } catch (error) {
      if (i === retries) {
        console.error(`Failed to fetch ${platform} after ${retries} retries:`, error.message);
        return { success: false, data: null };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * i)); // Exponential backoff
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main contests endpoint
app.get('/api/contests', async (req, res) => {
  try {
    // Fetch all platforms concurrently with individual timeouts and retries
    const [codeforces, codechef, leetcode] = await Promise.all([
      fetchWithRetry('CODEFORCES'),
      fetchWithRetry('CODECHEF'),
      fetchWithRetry('LEETCODE')
    ]);

    // Even if some platforms fail, return what we have
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        codeforces: codeforces.success ? codeforces.data : null,
        codechef: codechef.success ? codechef.data : null,
        leetcode: leetcode.success ? leetcode.data : null
      }
    };

    // Check if we got at least some data
    if (!codeforces.success && !codechef.success && !leetcode.success) {
      throw new Error('Failed to fetch data from all platforms');
    }

    res.json(response);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contest data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Options pre-flight
app.options('*', (req, res) => {
  res.status(200).end();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

module.exports = app;