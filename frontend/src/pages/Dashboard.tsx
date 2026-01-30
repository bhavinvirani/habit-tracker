import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TODO: Add dashboard stats cards */}
        <div className="card">
          <p className="text-sm text-gray-600">Total Habits</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Completed Today</p>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">0%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
