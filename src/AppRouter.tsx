import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import TransactionDetail from './TransactionDetail';
import HexConverter from './HexConverter';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/transaction/:hash" element={<TransactionDetail />} />
      <Route path="/hex-converter" element={<HexConverter />} />
    </Routes>
  );
};

export default AppRouter;