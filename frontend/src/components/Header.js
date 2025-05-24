import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // send cookie
      });

      navigate('/login'); // redirect to login
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Container className="d-flex justify-content-between">
        <Navbar.Brand>SOCA Dashboard</Navbar.Brand>
        <Button variant="outline-light" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
