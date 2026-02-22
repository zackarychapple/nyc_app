import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import RegistrationFlow from './components/Registration/RegistrationFlow';
import DashboardPage from './components/Dashboard/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-oat-light font-['DM_Sans']">
        <Header />
        <Routes>
          <Route path="/" element={<RegistrationFlow />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
