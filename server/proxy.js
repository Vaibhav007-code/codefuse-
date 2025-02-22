// api/proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const router = express.Router();

app.use(cors());

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

async function fetchPlatformData(platform) {
  try {
    const response = await axiosInstance.get(PLATFORM_APIS[platform]);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching ${platform}:`, error.message);
    return { success: false, data: null };
  }
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Contests endpoint
router.get('/contests', async (req, res) => {
  try {
    const results = await Promise.all([
      fetchPlatformData('CODEFORCES'),
      fetchPlatformData('CODECHEF'),
      fetchPlatformData('LEETCODE')
    ]);

    const [codeforces, codechef, leetcode] = results;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        codeforces: codeforces.success ? codeforces.data : null,
        codechef: codechef.success ? codechef.data : null,
        leetcode: leetcode.success ? leetcode.data : null
      }
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

app.use('/api', router);

// Export the Express app
module.exports = app;