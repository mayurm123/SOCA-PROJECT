import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { FaChartLine, FaHistory, FaStream } from 'react-icons/fa';
import './Dashboard.css'; // Custom styles (optional)
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  
        const navigate = useNavigate();
        const goToOptionChain = () => {
          navigate('/OptionChain');
         };
         const goToBacktetst = () => {
          navigate('/Backtest');
         };
         

  return (
    <Container fluid className="dashboard-container py-4 px-5">
      <h2 className="mb-4 text-primary">📊 Dashboard</h2>
      <Row className="g-4">
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaChartLine size={28} className="text-info me-2" />
                <Card.Title className="mb-0">Market Overview</Card.Title>
              </div>
              <Card.Text className="text-muted">Coming soon...</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaHistory size={28} className="text-success me-2" />
                <Card.Title className="mb-0" onClick={goToBacktetst} style={{ cursor: 'pointer' }}>Backtest Data</Card.Title>
              </div>
              <Card.Text className="text-muted">Click to view live data</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0" onClick={goToOptionChain} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaStream size={28} className="text-warning me-2" />
                <Card.Title className="mb-0">Live Option Chain</Card.Title>
              </div>
              <Card.Text className="text-muted">Click to view live data</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
