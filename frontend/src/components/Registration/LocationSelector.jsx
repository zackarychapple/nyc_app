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
      <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-1 md:mb-2">
        Welcome!
      </h1>
      <p className="text-gray-600 mb-5 md:mb-8 text-sm md:text-base">Where are you joining us from?</p>

      <div className="grid gap-3 md:gap-4">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="w-full bg-white rounded-xl shadow-md border-2 border-gray-100 p-4 md:p-6 text-left hover:shadow-xl hover:border-lava-400 hover:-translate-y-0.5 active:translate-y-0 active:bg-lava-50 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center min-h-[44px]">
              <span className="text-3xl md:text-4xl mr-3 md:mr-5 group-hover:scale-110 transition-transform duration-200">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-navy-900 group-hover:text-lava-600 transition-colors">
                  {opt.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">{opt.subtitle}</p>
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
