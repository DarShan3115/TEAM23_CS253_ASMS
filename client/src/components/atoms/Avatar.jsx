import React from 'react';

const Avatar = ({ first, last }) => (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
    {first?.[0]}{last?.[0]}
  </div>
);

export default Avatar;