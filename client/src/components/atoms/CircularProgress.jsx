import React from 'react';

const CircularProgress = ({ percentage = 0, size = 60, strokeWidth = 6, color = "blue" }) => {
  // Ensure percentage is a valid number to prevent NaN errors
  const safePercentage = isNaN(percentage) || percentage === null ? 0 : Math.min(Math.max(percentage, 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safePercentage / 100) * circumference;
  
  const colors = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="stroke-gray-700"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colors[color] || colors.blue} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? circumference : offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-white">{Math.round(safePercentage)}%</span>
    </div>
  );
};

export default CircularProgress;