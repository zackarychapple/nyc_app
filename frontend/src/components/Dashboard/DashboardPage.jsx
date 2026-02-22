import React from 'react';

function DashboardPage() {
  const dashboardUrl = process.env.REACT_APP_DASHBOARD_EMBED_URL;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Live Dashboard</h1>
        <p className="text-gray-600">
          See who's here and what they're excited about — powered by Databricks
        </p>
      </div>

      {/* Map Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          <i className="fas fa-map-marked-alt mr-2 text-lava-500"></i>
          NYC Registration Map
        </h2>
        <div className="bg-oat-medium rounded-lg flex items-center justify-center" style={{ height: 400 }}>
          <div className="text-center text-gray-400">
            <i className="fas fa-map text-5xl mb-3 block"></i>
            <p className="font-medium">Kepler.gl Map</p>
            <p className="text-sm">Will display registration density by neighborhood</p>
          </div>
        </div>
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
