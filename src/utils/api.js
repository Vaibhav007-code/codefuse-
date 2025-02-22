import axios from 'axios';

// Platform configurations remain the same
export const PLATFORM_COLORS = {
  CodeForces: '#1ba94c',
  CodeChef: '#5b4638',
  LeetCode: '#ffa116',
  Default: '#6c757d'
};

export const PLATFORMS = {
  ALL: 'All Platforms',
  CODEFORCES: 'CodeForces',
  CODECHEF: 'CodeChef',
  LEETCODE: 'LeetCode'
};

export const CONTEST_STATUS = {
  ALL: 'All',
  ACTIVE: 'Active',
  UPCOMING: 'Upcoming',
  PAST: 'Past'
};

// Create axios instance with detailed error logging
const axiosInstance = axios.create({
  baseURL: '/api',  // This will be relative to wherever the app is hosted
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  response => {
    console.log('Received response:', response.status);
    return response;
  },
  error => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Main API function with improved error handling
export const fetchContests = async () => {
  console.log('Fetching contests...');
  try {
    // First try health check
    try {
      const healthCheck = await axiosInstance.get('/health');
      console.log('Health check response:', healthCheck.data);
    } catch (healthError) {
      console.error('Health check failed:', healthError);
    }

    // Then fetch contests
    const response = await axiosInstance.get('/contests');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch contests');
    }

    console.log('Raw contest data:', response.data);

    const { codeforces, codechef, leetcode } = response.data.data;

    const allContests = [
      ...processContests(PLATFORMS.CODEFORCES, codeforces),
      ...processContests(PLATFORMS.CODECHEF, codechef),
      ...processContests(PLATFORMS.LEETCODE, leetcode)
    ].sort((a, b) => a.start_time - b.start_time);

    console.log('Processed contests:', allContests.length);
    return { success: true, data: allContests };
  } catch (error) {
    console.error('Fetch contests error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch contests'
    };
  }
};

// Process contests helper function
const processContests = (platform, data) => {
  if (!data) {
    console.log(`No data for ${platform}`);
    return [];
  }

  try {
    let processed = [];
    switch(platform) {
      case PLATFORMS.CODEFORCES:
        processed = (data.result || [])
          .filter(c => c.phase !== 'FINISHED')
          .map(c => ({
            id: `cf-${c.id}`,
            name: c.name,
            url: `https://codeforces.com/contests/${c.id}`,
            start_time: (c.startTimeSeconds || 0) * 1000,
            end_time: ((c.startTimeSeconds || 0) + (c.durationSeconds || 0)) * 1000,
            platform: PLATFORMS.CODEFORCES,
            status: c.phase === 'BEFORE' ? 'UPCOMING' : 'ACTIVE'
          }));
        break;

      case PLATFORMS.CODECHEF:
        processed = [
          ...(data.future_contests || []),
          ...(data.present_contests || [])
        ].map(c => ({
          id: `cc-${c.contest_code}`,
          name: c.contest_name,
          url: `https://www.codechef.com/${c.contest_code}`,
          start_time: new Date(c.contest_start_date).getTime(),
          end_time: new Date(c.contest_end_date).getTime(),
          platform: PLATFORMS.CODECHEF,
          status: c.contest_status === 'Upcoming' ? 'UPCOMING' : 'ACTIVE'
        }));
        break;

      case PLATFORMS.LEETCODE:
        processed = (data.contests || [])
          .filter(c => c.start_time)
          .map(c => ({
            id: `lc-${c.titleSlug}`,
            name: c.title,
            url: `https://leetcode.com/contest/${c.titleSlug}`,
            start_time: (c.start_time || 0) * 1000,
            end_time: ((c.start_time || 0) + (c.duration || 0)) * 1000,
            platform: PLATFORMS.LEETCODE,
            status: Date.now() < (c.start_time * 1000) ? 'UPCOMING' : 'ACTIVE'
          }));
        break;
    }
    console.log(`Processed ${processed.length} contests for ${platform}`);
    return processed;
  } catch (error) {
    console.error(`Error processing ${platform} contests:`, error);
    return [];
  }
};

// Rest of the reminder functions remain the same...