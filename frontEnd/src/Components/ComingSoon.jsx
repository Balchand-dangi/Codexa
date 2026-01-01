
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
        <p className="text-gray-600 mb-6">This feature is under development</p>
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default ComingSoon;
