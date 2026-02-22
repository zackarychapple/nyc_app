import React, { useState } from 'react';
import states from '../../data/us-states.json';

function StateSelector({ onComplete, onBack }) {
  const [state, setState] = useState('');

  const handleSubmit = () => {
    if (state) {
      onComplete(state);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-navy-900 mb-2">Your State</h2>
      <p className="text-gray-600 mb-8">Where are you traveling from?</p>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-left">
        <label className="block mb-1 text-sm font-medium text-navy-800">State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full mb-6 p-3 rounded-lg border border-gray-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-lava-500 focus:border-transparent"
        >
          <option value="">Select your state...</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!state}
            className="px-6 py-3 rounded-lg font-medium bg-lava-500 text-white hover:bg-lava-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default StateSelector;
