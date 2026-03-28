import React from 'react';

const Badge = ({ variant, children }) => {
  const styles = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-orange-500/10 text-orange-500',
    low: 'bg-blue-500/10 text-blue-500',
    default: 'bg-gray-700 text-gray-300'
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

export default Badge;