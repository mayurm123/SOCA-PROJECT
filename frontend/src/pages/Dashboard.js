import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <div className="p-3">
      <h2>Dashboard</h2>
      <Row className="mt-3">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Market Overview</Card.Title>
              <Card.Text>Coming soon...</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Backtest Results</Card.Title>
              <Card.Text>Coming soon...</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Live Option Chain</Card.Title>
              <Card.Text>Coming soon...</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

