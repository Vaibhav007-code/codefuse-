import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Row, Col, Alert } from 'react-bootstrap';
import { PLATFORMS, CONTEST_STATUS, PLATFORM_COLORS } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import ReminderModal from './ReminderModal';

const ContestList = ({ contests, selectedPlatform, selectedStatus }) => {
  const [filteredContests, setFilteredContests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const filterContests = () => {
      return contests.filter(contest => {
        const platformMatch = selectedPlatform === PLATFORMS.ALL || 
                            contest.platform === selectedPlatform;
        const statusMatch = selectedStatus === CONTEST_STATUS.ALL ||
                          contest.status === selectedStatus.toUpperCase();
        return platformMatch && statusMatch;
      });
    };
    setFilteredContests(filterContests());
  }, [contests, selectedPlatform, selectedStatus]);

  const statusColors = {
    UPCOMING: 'warning',
    ACTIVE: 'success',
    PAST: 'secondary'
  };

  return (
    <>
      <Row className="g-4">
        {filteredContests.length > 0 ? (
          filteredContests.map(contest => (
            <Col key={contest.id} xs={12} md={6} lg={4}>
              <Card className={`h-100 shadow ${darkMode ? 'bg-dark text-light' : ''}`}>
                <Card.Header 
                  style={{ backgroundColor: PLATFORM_COLORS[contest.platform] }}
                  className="d-flex justify-content-between align-items-center"
                >
                  <Card.Title className="mb-0 text-light">{contest.platform}</Card.Title>
                  <Badge bg={statusColors[contest.status]}>
                    {CONTEST_STATUS[contest.status]}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{contest.name}</Card.Title>
                  <Card.Text>
                    <strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}<br/>
                    <strong>End:</strong> {new Date(contest.end_time).toLocaleString()}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant={darkMode ? 'outline-light' : 'primary'}
                      href={contest.url} 
                      target="_blank"
                    >
                      Register
                    </Button>
                    <Button 
                      variant={darkMode ? 'outline-warning' : 'outline-primary'}
                      onClick={() => {
                        setSelectedContest(contest);
                        setShowModal(true);
                      }}
                    >
                      ⏰ Remind
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info" className="text-center">
              No contests found matching your criteria
            </Alert>
          </Col>
        )}
      </Row>

      <ReminderModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        contest={selectedContest}
      />
    </>
  );
};

export default ContestList;