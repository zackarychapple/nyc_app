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
            className="w-full bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 md:p-6 text-left hover:shadow-xl hover:border-lava-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-3xl md:text-4xl mr-4 md:mr-5 group-hover:scale-110 transition-transform duration-200">{opt.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-navy-900 group-hover:text-lava-600 transition-colors">
                  {opt.title}
                </h3>
                <p className="text-sm text-gray-500">{opt.subtitle}</p>
              </div>
              <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-lava-500 group-hover:translate-x-1 transition-all duration-200"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationSelector;
