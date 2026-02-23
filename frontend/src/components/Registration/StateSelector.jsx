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

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 text-left">
        <label className="block mb-1.5 text-sm font-semibold text-navy-800">State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full mb-8 p-3 rounded-lg border-2 border-gray-200 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-lava-400 focus:border-lava-400 hover:border-gray-300 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Select your state...</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!state}
            className="px-6 py-3 rounded-lg font-semibold bg-lava-500 text-white hover:bg-lava-600 hover:shadow-md active:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default StateSelector;
