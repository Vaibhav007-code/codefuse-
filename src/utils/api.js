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

const processContests = (platform, data) => {
  if (!data) return [];

  switch(platform) {
    case PLATFORMS.CODEFORCES:
      return (data.result || []).filter(c => c.phase !== 'FINISHED').map(c => ({
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
        start_time: new Date(c.contest_start_date).getTime() || Date.now(),
        end_time: new Date(c.contest_end_date).getTime() || Date.now(),
        platform: PLATFORMS.CODECHEF,
        status: c.contest_status === 'Upcoming' ? 'UPCOMING' : 'ACTIVE'
      }));

    case PLATFORMS.LEETCODE:
      return (data.contests || []).filter(c => c.start_time).map(c => ({
        id: `lc-${c.titleSlug}`,
        name: c.title,
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        start_time: (c.start_time || 0) * 1000,
        end_time: ((c.start_time || 0) + (c.duration || 0)) * 1000,
        platform: PLATFORMS.LEETCODE,
        status: Date.now() < (c.start_time * 1000) ? 'UPCOMING' : 'ACTIVE'
      }));

    default: return [];
  }
};

export const fetchContests = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/contests');
    
    const codeforcesData = response.data.data.codeforces || {};
    const codechefData = response.data.data.codechef || {};
    const leetcodeData = response.data.data.leetcode || {};

    const allContests = [
      ...processContests(PLATFORMS.CODEFORCES, codeforcesData),
      ...processContests(PLATFORMS.CODECHEF, codechefData),
      ...processContests(PLATFORMS.LEETCODE, leetcodeData)
    ].sort((a, b) => a.start_time - b.start_time);

    return { success: true, data: allContests };
  } catch (error) {
    console.error('Error fetching contests:', error);
    return { success: false, data: [], message: 'Failed to fetch contests' };
  }
};

export const setContestReminder = (contestId, reminderTime) => {
  const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
  reminders[contestId] = reminderTime.getTime();
  localStorage.setItem('contestReminders', JSON.stringify(reminders));
  return { success: true, message: 'Reminder set successfully' };
};

export const checkReminders = () => {
  const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
  const now = Date.now();
  Object.entries(reminders).forEach(([id, time]) => {
    if (time <= now) delete reminders[id];
  });
  localStorage.setItem('contestReminders', JSON.stringify(reminders));
};

export default {
  fetchContests,
  PLATFORM_COLORS,
  PLATFORMS,
  CONTEST_STATUS
};