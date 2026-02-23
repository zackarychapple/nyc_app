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
      <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-1 md:mb-2">NYC Location</h2>
      <p className="text-gray-600 mb-4 md:mb-8 text-sm md:text-base">Tell us your borough and neighborhood</p>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 md:p-8 text-left">
        <label className="block mb-1.5 text-sm font-semibold text-navy-800">Borough</label>
        <select
          value={borough}
          onChange={(e) => {
            setBorough(e.target.value);
            setNeighborhood('');
          }}
          className="w-full mb-5 p-3.5 md:p-3 rounded-lg border-2 border-gray-200 text-navy-900 text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lava-400 focus:border-lava-400 hover:border-gray-300 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Select a borough...</option>
          {boroughs.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label className="block mb-1.5 text-sm font-semibold text-navy-800">Neighborhood</label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled={!borough}
          className="w-full mb-6 md:mb-8 p-3.5 md:p-3 rounded-lg border-2 border-gray-200 text-navy-900 text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lava-400 focus:border-lava-400 hover:border-gray-300 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200"
        >
          <option value="">
            {borough ? 'Select a neighborhood...' : 'Select a borough first'}
          </option>
          {borough &&
            neighborhoods[borough].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
        </select>

        <div className="flex flex-col-reverse md:flex-row md:justify-between gap-2 md:gap-0">
          <button
            onClick={onBack}
            className="w-full md:w-auto px-6 py-3.5 md:py-3 rounded-lg font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!borough || !neighborhood}
            className="w-full md:w-auto px-6 py-3.5 md:py-3 rounded-lg font-semibold bg-lava-500 text-white hover:bg-lava-600 hover:shadow-md active:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none text-center"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoroughSelector;
