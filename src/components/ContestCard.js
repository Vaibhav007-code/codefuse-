import React from 'react';
import { PLATFORM_COLORS, CONTEST_STATUS } from '../utils/api';

const ContestCard = ({ contest, onSetReminder }) => {
  const statusColors = {
    UPCOMING: 'warning',
    ACTIVE: 'success',
    PAST: 'secondary'
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center" 
           style={{ backgroundColor: PLATFORM_COLORS[contest.platform] || PLATFORM_COLORS.Default }}>
        <h5 className="mb-0 text-white">{contest.name}</h5>
        <span className="badge bg-dark">{contest.platform}</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <span>Start: {new Date(contest.start_time).toLocaleString()}</span>
          <span>End: {new Date(contest.end_time).toLocaleString()}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className={`badge bg-${statusColors[contest.status]}`}>
            {CONTEST_STATUS[contest.status]}
          </span>
          <div>
            <a href={contest.url} target="_blank" rel="noopener noreferrer" 
               className="btn btn-sm btn-primary me-2">
              Register
            </a>
            <button onClick={() => onSetReminder(contest)} 
                    className="btn btn-sm btn-outline-danger">
              ⏰ Set Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;