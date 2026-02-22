import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b-2 border-lava-500">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-navy-900 no-underline">
            DBX Demo NYC
          </Link>
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                location.pathname === '/'
                  ? 'bg-lava-500 text-white'
                  : 'text-navy-800 hover:bg-oat-medium'
              }`}
            >
              <i className="fas fa-user-plus mr-2"></i>
              Register
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                location.pathname === '/dashboard'
                  ? 'bg-lava-500 text-white'
                  : 'text-navy-800 hover:bg-oat-medium'
              }`}
            >
              <i className="fas fa-chart-bar mr-2"></i>
              Live Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
