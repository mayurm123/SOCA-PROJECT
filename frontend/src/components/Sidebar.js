import React from 'react';
import { Nav } from 'react-bootstrap';

const Sidebar = () => {
  return (
    <div className="bg-light border-end vh-100 p-3" style={{ width: '220px' }}>
      <h4>SOCA</h4>
      <Nav className="flex-column">
        <Nav.Link href="#">Dashboard</Nav.Link>
        <Nav.Link href="#">Backtest</Nav.Link>
        <Nav.Link href="#">Live Data</Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
