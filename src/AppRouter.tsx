import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import TransactionDetail from './TransactionDetail';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/transaction/:hash" element={<TransactionDetail />} />
    </Routes>
  );
};

export default AppRouter;