import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // ✅ Import React Router Link

const Sidebar = () => {
  return (
    <div className="bg-light border-end vh-100 p-3" style={{ width: '220px' }}>
      <h4>SOCA</h4>
      <Nav className="flex-column">
        <Nav.Link as={Link} to="#">Dashboard</Nav.Link>
        <Nav.Link as={Link} to="/Backtest">Backtest</Nav.Link>
        <Nav.Link as={Link} to="/OptionChain">Live Data</Nav.Link> {/* ✅ Proper routing */}
      </Nav>
    </div>
  );
};

export default Sidebar;

