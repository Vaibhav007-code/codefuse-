import React, { useState, useEffect } from 'react';
import { Container, Spinner, Form, Row, Col } from 'react-bootstrap';
import { fetchContests, PLATFORMS, CONTEST_STATUS } from '../utils/api';
import ContestList from '../components/ContestList';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const [contests, setContests] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS.ALL);
  const [selectedStatus, setSelectedStatus] = useState(CONTEST_STATUS.ALL);
  const { darkMode } = useTheme();

  useEffect(() => {
    const loadContests = async () => {
      const response = await fetchContests();
      response.success && setContests(response.data);
    };
    loadContests();
  }, []);

  return (
    <Container className="py-4">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold">CodeFuse</h1>
        <p className="lead">Your Coding Contest Hub</p>
      </header>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Form.Select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className={darkMode ? 'bg-dark text-light' : ''}
          >
            {Object.values(PLATFORMS).map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={darkMode ? 'bg-dark text-light' : ''}
          >
            {Object.values(CONTEST_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {contests.length > 0 ? (
        <ContestList
          contests={contests}
          selectedPlatform={selectedPlatform}
          selectedStatus={selectedStatus}
        />
      ) : (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading contests...</p>
        </div>
      )}
    </Container>
  );
};

export default Home;