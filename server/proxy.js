const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    'https://codefuse.vercel.app'
  ],
  methods: ['GET']
}));

const PLATFORM_APIS = {
  CODEFORCES: 'https://codeforces.com/api/contest.list',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all',
  LEETCODE: 'https://leetcode.com/contest/api/list/'
};

app.get('/api/contests', async (req, res) => {
  try {
    const [codeforces, codechef, leetcode] = await Promise.allSettled([
      axios.get(PLATFORM_APIS.CODEFORCES),
      axios.get(PLATFORM_APIS.CODECHEF, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }),
      axios.get(PLATFORM_APIS.LEETCODE)
    ]);

    res.json({
      success: true,
      data: {
        codeforces: codeforces.status === 'fulfilled' ? codeforces.value.data : null,
        codechef: codechef.status === 'fulfilled' ? codechef.value.data : null,
        leetcode: leetcode.status === 'fulfilled' ? leetcode.value.data : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;