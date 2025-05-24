// src/App.js// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

console.log('ProtectedRoute:', ProtectedRoute);
console.log('Layout:', Layout);
//console.log('Dashboard:', Dashboard);
console.log('Login:', Login);
console.log('Register:', Register);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         {/* <Route path="/Layout" element={<Layout />} /> */}
        {/* Protected Route with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/"
          element={
              <Layout />
          }
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
