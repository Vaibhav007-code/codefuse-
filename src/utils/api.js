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

// ... (keep all existing processContests and fetchContests functions) ...

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

const apiExports = {
  fetchContests,
  setContestReminder,
  checkReminders,
  PLATFORM_COLORS,
  PLATFORMS,
  CONTEST_STATUS
};

export default apiExports;