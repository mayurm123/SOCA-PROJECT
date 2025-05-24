// src/components/Layout.js
// Layout.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';

const Layout = () => {
  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-3">
          <Dashboard />
        </div>
      </div>
    </>
  );
};

export default Layout;

