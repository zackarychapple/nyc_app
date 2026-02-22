import React from 'react';

const options = [
  {
    type: 'nyc',
    icon: '🏙️',
    title: "I'm from NYC",
    subtitle: 'Select your borough & neighborhood',
  },
  {
    type: 'ny_state',
    icon: '🗽',
    title: "I'm from New York State",
    subtitle: 'Outside the five boroughs',
  },
  {
    type: 'other_state',
    icon: '🇺🇸',
    title: "I'm from outside New York",
    subtitle: 'Select your state',
  },
];

function LocationSelector({ onSelect }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-navy-900 mb-2">
        Welcome!
      </h1>
      <p className="text-gray-600 mb-8">Where are you joining us from?</p>

      <div className="grid gap-4">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 text-left hover:shadow-lg hover:border-lava-400 transition-all group cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-4xl mr-5">{opt.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-navy-900 group-hover:text-lava-600 transition-colors">
                  {opt.title}
                </h3>
                <p className="text-sm text-gray-500">{opt.subtitle}</p>
              </div>
              <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-lava-500 transition-colors"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationSelector;
