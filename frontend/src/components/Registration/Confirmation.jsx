import React from 'react';
import { Link } from 'react-router-dom';

function Confirmation({ userId }) {
  return (
    <div className="text-center">
      <div className="bg-gradient-to-br from-lava-500 to-lava-600 rounded-xl p-10 text-white mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-3">Thanks for registering!</h2>
        <p className="text-lg opacity-90">
          Your response has been recorded. Check out the live dashboard to see who else is here.
        </p>
      </div>

      <Link
        to="/dashboard"
        className="inline-flex items-center bg-navy-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-navy-800 transition-colors no-underline text-lg"
      >
        <i className="fas fa-chart-bar mr-3"></i>
        View Live Dashboard
      </Link>

      <p className="mt-6 text-xs text-gray-400">
        Your ID: <code className="bg-oat-medium px-2 py-1 rounded text-gray-500">{userId}</code>
      </p>
    </div>
  );
}

export default Confirmation;
