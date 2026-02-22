import React, { useState } from 'react';
import neighborhoods from '../../data/neighborhoods.json';

const boroughs = Object.keys(neighborhoods);

function BoroughSelector({ onComplete, onBack }) {
  const [borough, setBorough] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const handleSubmit = () => {
    if (borough && neighborhood) {
      onComplete(borough, neighborhood);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-navy-900 mb-2">NYC Location</h2>
      <p className="text-gray-600 mb-8">Tell us your borough and neighborhood</p>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-left">
        <label className="block mb-1 text-sm font-medium text-navy-800">Borough</label>
        <select
          value={borough}
          onChange={(e) => {
            setBorough(e.target.value);
            setNeighborhood('');
          }}
          className="w-full mb-5 p-3 rounded-lg border border-gray-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-lava-500 focus:border-transparent"
        >
          <option value="">Select a borough...</option>
          {boroughs.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label className="block mb-1 text-sm font-medium text-navy-800">Neighborhood</label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled={!borough}
          className="w-full mb-6 p-3 rounded-lg border border-gray-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-lava-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {borough ? 'Select a neighborhood...' : 'Select a borough first'}
          </option>
          {borough &&
            neighborhoods[borough].map((n) => (
              <option key={n} value={n}>{n}</option>
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
            disabled={!borough || !neighborhood}
            className="px-6 py-3 rounded-lg font-medium bg-lava-500 text-white hover:bg-lava-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoroughSelector;
