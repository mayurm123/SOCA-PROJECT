// src/App.js// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import OptionChain from './pages/OptionChain';
import Backtest from './pages/Backtest';


console.log('ProtectedRoute:', ProtectedRoute);
console.log('Layout:', Layout);
console.log('Login:', Login);
console.log('Register:', Register);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
         {/* <Route path="/Layout" element={<Layout />} /> */}
        {/* Protected Route with Layout */}
        <Route
          path="/OptionChain"
          element={
            <ProtectedRoute>
              <OptionChain />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Backtest"
          element={
            <ProtectedRoute>
              <Backtest />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
