const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  credentials: true
}));

// Configure axios instance with timeout
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const PLATFORM_APIS = {
  CODEFORCES: 'https://codeforces.com/api/contest.list',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all',
  LEETCODE: 'https://leetcode.com/contest/api/list/'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/contests', async (req, res) => {
  try {
    // Fetch data from all platforms concurrently
    const results = await Promise.allSettled([
      axiosInstance.get(PLATFORM_APIS.CODEFORCES),
      axiosInstance.get(PLATFORM_APIS.CODECHEF),
      axiosInstance.get(PLATFORM_APIS.LEETCODE)
    ]);

    // Process results and handle errors for each platform
    const [codeforces, codechef, leetcode] = results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value.data;
      }
      console.error(`API Error: ${result.reason}`);
      return null;
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        codeforces,
        codechef,
        leetcode
      }
    });
  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch contest data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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