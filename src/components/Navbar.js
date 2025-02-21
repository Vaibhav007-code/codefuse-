import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const CustomNavbar = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Navbar bg={darkMode ? 'dark' : 'light'} expand="lg">
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img
            src="https://i.ibb.co/HT9f09zr/codefuse-logo.png"
            width="40"
            height="40"
            className="d-inline-block align-top"
            alt="CodeFuse logo"
          />
          <span className="ms-2 fw-bold">CodeFuse</span>
        </Navbar.Brand>
        <Button 
          onClick={toggleTheme} 
          variant={darkMode ? 'outline-light' : 'outline-dark'}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Button>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;