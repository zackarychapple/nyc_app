import React, { useEffect, useState, useCallback } from 'react';
import NYCMap from './NYCMap';
import { getRegistrations } from '../../services/api';

const POLL_INTERVAL = 10000; // 10 seconds

function DashboardPage() {
  const dashboardUrl = process.env.REACT_APP_DASHBOARD_EMBED_URL;
  const [registrations, setRegistrations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getRegistrations();
      setRegistrations(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Live Dashboard</h1>
        <p className="text-gray-600">
          See who's here and what they're excited about — powered by Databricks
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-1">
            <i className="fas fa-sync-alt mr-1"></i>
            Auto-refreshing every 10s — Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-lava-500">{registrations.length}</div>
          <div className="text-sm text-gray-500">Total Registered</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-navy-900">
            {registrations.filter((r) => r.location_type === 'nyc').length}
          </div>
          <div className="text-sm text-gray-500">From NYC</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-navy-800">
            {new Set(registrations.filter((r) => r.borough).map((r) => r.borough)).size}
          </div>
          <div className="text-sm text-gray-500">Boroughs Represented</div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          <i className="fas fa-map-marked-alt mr-2 text-lava-500"></i>
          NYC Registration Map
        </h2>
        <NYCMap registrations={registrations} />
      </section>

      {/* Embedded Dashboard Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          <i className="fas fa-chart-bar mr-2 text-lava-500"></i>
          Top Reasons for Attending
        </h2>
        {dashboardUrl ? (
          <iframe
            src={dashboardUrl}
            title="Databricks Dashboard"
            className="w-full rounded-lg border-0"
            style={{ height: 500 }}
          />
        ) : (
          <div className="bg-oat-medium rounded-lg flex items-center justify-center" style={{ height: 300 }}>
            <div className="text-center text-gray-400">
              <i className="fas fa-chart-pie text-5xl mb-3 block"></i>
              <p className="font-medium">Databricks AI/BI Dashboard</p>
              <p className="text-sm">Will show topic analysis of attendee reasons</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;
