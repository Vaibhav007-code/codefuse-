// server/proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Basic CORS setup for development
app.use(cors());

// Configure axios instance
const axiosInstance = axios.create({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

const PLATFORM_APIS = {
  CODEFORCES: 'https://codeforces.com/api/contest.list',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all?mode=all',
  LEETCODE: 'https://leetcode.com/contest/api/list/'
};

// Helper function to fetch data with retries
async function fetchPlatformData(platform) {
  const url = PLATFORM_APIS[platform];
  let attempts = 3;
  
  while (attempts > 0) {
    try {
      const response = await axiosInstance.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      attempts--;
      if (attempts === 0) {
        console.error(`Failed to fetch ${platform}:`, error.message);
        return { success: false, data: null };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// Main contests endpoint
app.get('/api/contests', async (req, res) => {
  console.log('Fetching contests...');
  
  try {
    const platforms = ['CODEFORCES', 'CODECHEF', 'LEETCODE'];
    const results = await Promise.all(
      platforms.map(platform => fetchPlatformData(platform))
    );

    const data = {
      codeforces: results[0].data,
      codechef: results[1].data,
      leetcode: results[2].data
    };

    // Check if we got any data
    const hasAnyData = Object.values(data).some(d => d !== null);
    
    if (!hasAnyData) {
      throw new Error('Failed to fetch data from all platforms');
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contest data',
      error: error.message
    });
  }
});

// Handle pre-flight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

module.exports = app;