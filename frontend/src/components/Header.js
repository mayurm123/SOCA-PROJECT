import React, { useEffect, useState } from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState('');

  // Fetch username from backend or localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/user', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Container className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          {location.pathname !== '/' && (
            <Button variant="outline-light" size="sm" onClick={() => navigate(-1)}>
              ⬅ Back
            </Button>
          )}
          <Navbar.Brand>SOCA OPTION CHAIN</Navbar.Brand>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white">Hi, {user.fullName}</span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
