import axios from 'axios';

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

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://your-vercel-app.vercel.app/api' // Update with your Vercel URL
    : '/api'
});

const handleApiError = (error) => {
  console.error('API Error:', {
    config: error.config,
    response: error.response
  });
  return {
    success: false,
    data: [],
    message: error.response?.data?.message || error.message || 'Network error'
  };
};

const processContests = (platform, data) => {
  if (!data) return [];

  try {
    switch(platform) {
      case PLATFORMS.CODEFORCES:
        return (data.result || [])
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

      case PLATFORMS.CODECHEF:
        return [
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

      case PLATFORMS.LEETCODE:
        return (data.contests || [])
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

      default:
        return [];
    }
  } catch (error) {
    console.error(`Processing error for ${platform}:`, error);
    return [];
  }
};

export const fetchContests = async (retries = 2) => {
  try {
    const response = await axiosInstance.get('/contests');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API returned unsuccessful response');
    }

    const allContests = [
      ...processContests(PLATFORMS.CODEFORCES, response.data.data.codeforces),
      ...processContests(PLATFORMS.CODECHEF, response.data.data.codechef),
      ...processContests(PLATFORMS.LEETCODE, response.data.data.leetcode)
    ].sort((a, b) => a.start_time - b.start_time);

    return { 
      success: true, 
      data: allContests,
      errors: response.data.errors || []
    };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchContests(retries - 1);
    }
    return handleApiError(error);
  }
};
