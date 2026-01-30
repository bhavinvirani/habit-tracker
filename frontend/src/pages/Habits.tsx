import React from 'react';

const Habits: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Habits</h1>
      <div className="card">
        <p className="text-gray-600">No habits yet. Create your first habit!</p>
        {/* TODO: Add habit list and creation form */}
      </div>
    </div>
  );
};

export default Habits;
