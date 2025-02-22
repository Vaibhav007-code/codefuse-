import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codefuse.vercel.app'
  : '';

// Platform configurations
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

// Helper functions
const processContests = (platform, data) => {
  if (!data) return [];

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
};

// API functions
export const fetchContests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/contests`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch contests');
    }

    const { codeforces, codechef, leetcode } = response.data.data;

    const allContests = [
      ...processContests(PLATFORMS.CODEFORCES, codeforces),
      ...processContests(PLATFORMS.CODECHEF, codechef),
      ...processContests(PLATFORMS.LEETCODE, leetcode)
    ].sort((a, b) => a.start_time - b.start_time);

    return { success: true, data: allContests };
  } catch (error) {
    console.error('Error fetching contests:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message || 'Failed to fetch contests' 
    };
  }
};

export const setContestReminder = (contestId, reminderTime) => {
  try {
    const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
    reminders[contestId] = reminderTime.getTime();
    localStorage.setItem('contestReminders', JSON.stringify(reminders));
    return { success: true, message: 'Reminder set successfully' };
  } catch (error) {
    console.error('Error setting reminder:', error);
    return { success: false, message: 'Failed to set reminder' };
  }
};

export const getContestReminder = (contestId) => {
  try {
    const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
    return reminders[contestId] || null;
  } catch {
    return null;
  }
};

export const checkReminders = () => {
  try {
    const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
    const now = Date.now();
    let updated = false;

    Object.entries(reminders).forEach(([id, time]) => {
      if (time <= now) {
        delete reminders[id];
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('contestReminders', JSON.stringify(reminders));
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};