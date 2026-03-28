import React from 'react';

const RiskBadge = ({ level }) => {
  const styles = {
    Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    Stable: 'bg-green-500/10 text-green-500 border-green-500/20',
    Warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${styles[level] || styles.Stable}`}>
      {level}
    </span>
  );
};

export default RiskBadge;