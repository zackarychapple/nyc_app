// Maps curated registration neighborhood names → NTA GeoJSON feature name(s).
// One curated name may map to multiple NTA polygons (e.g., "Upper East Side" spans 3 NTAs).
// Multiple curated names may map to the same NTA polygon — counts are summed correctly.

const neighborhoodToNtaMap = {
  // === Manhattan ===
  'Lower East Side': ['Lower East Side'],
  'East Village': ['East Village'],
  'Greenwich Village': ['Greenwich Village'],
  'SoHo': ['SoHo-Little Italy-Hudson Square'],
  'Tribeca': ['Tribeca-Civic Center'],
  'Chelsea': ['Chelsea-Hudson Yards'],
  'Midtown': ['Midtown-Times Square', 'Midtown South-Flatiron-Union Square'],
  'Upper East Side': ['Upper East Side-Carnegie Hill', 'Upper East Side-Lenox Hill-Roosevelt Island', 'Upper East Side-Yorkville'],
  'Upper West Side': ['Upper West Side (Central)', 'Upper West Side-Lincoln Square', 'Upper West Side-Manhattan Valley'],
  'Harlem': ['Harlem (North)', 'Harlem (South)'],
  'Washington Heights': ['Washington Heights (North)', 'Washington Heights (South)'],
  'Inwood': ['Inwood'],
  'Financial District': ['Financial District-Battery Park City'],
  'Chinatown': ['Chinatown-Two Bridges'],
  "Hell's Kitchen": ["Hell's Kitchen"],

  // === Brooklyn ===
  'Williamsburg': ['Williamsburg'],
  'Greenpoint': ['Greenpoint'],
  'Fort Greene': ['Fort Greene'],
  'Park Slope': ['Park Slope'],
  'DUMBO': ['Downtown Brooklyn-DUMBO-Boerum Hill'],
  'Brooklyn Heights': ['Brooklyn Heights'],
  'Bed-Stuy': ['Bedford-Stuyvesant (West)', 'Bedford-Stuyvesant (East)'],
  'Bushwick': ['Bushwick (East)', 'Bushwick (West)'],
  'Crown Heights': ['Crown Heights (North)', 'Crown Heights (South)'],
  'Sunset Park': ['Sunset Park (Central)', 'Sunset Park (West)'],
  'Bay Ridge': ['Bay Ridge'],
  'Flatbush': ['Flatbush'],
  'Prospect Heights': ['Prospect Heights'],
  'Red Hook': ['Carroll Gardens-Cobble Hill-Gowanus-Red Hook'],
  'Cobble Hill': ['Carroll Gardens-Cobble Hill-Gowanus-Red Hook'],

  // === Queens ===
  'Astoria': ['Astoria (Central)', 'Astoria (North)-Ditmars-Steinway', 'Old Astoria-Hallets Point'],
  'Long Island City': ['Long Island City-Hunters Point'],
  'Jackson Heights': ['Jackson Heights'],
  'Flushing': ['Flushing-Willets Point'],
  'Forest Hills': ['Forest Hills'],
  'Ridgewood': ['Ridgewood'],
  'Sunnyside': ['Sunnyside'],
  'Woodside': ['Woodside'],
  'Jamaica': ['Jamaica'],
  'Bayside': ['Bayside'],
  'Elmhurst': ['Elmhurst'],
  'Corona': ['Corona'],
  'Rockaway Beach': ['Rockaway Beach-Arverne-Edgemere'],

  // === The Bronx ===
  'South Bronx': ['Mott Haven-Port Morris', 'Melrose', 'Hunts Point', 'Longwood'],
  'Mott Haven': ['Mott Haven-Port Morris'],
  'Fordham': ['Fordham Heights'],
  'Riverdale': ['Riverdale-Spuyten Duyvil'],
  'Kingsbridge': ['Kingsbridge-Marble Hill'],
  'Pelham Bay': ['Pelham Bay-Country Club-City Island'],
  'Tremont': ['Tremont'],
  'Concourse': ['Concourse-Concourse Village'],
  'Hunts Point': ['Hunts Point'],
  'Norwood': ['Norwood'],

  // === Staten Island ===
  'St. George': ['St. George-New Brighton'],
  'Stapleton': ['Tompkinsville-Stapleton-Clifton-Fox Hills'],
  'Tottenville': ['Tottenville-Charleston'],
  'Great Kills': ['Great Kills-Eltingville'],
  'New Dorp': ['New Dorp-Midland Beach'],
  'West Brighton': ['West New Brighton-Silver Lake-Grymes Hill'],
  'Port Richmond': ['Port Richmond'],
};

export default neighborhoodToNtaMap;
