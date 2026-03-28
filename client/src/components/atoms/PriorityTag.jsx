import React from 'react';

const PriorityTag = ({ priority }) => {
  const colors = {
    High: 'text-red-400 bg-red-400/10 border-red-400/20',
    Medium: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${colors[priority] || colors.Medium}`}>
      {priority}
    </span>
  );
};

export default PriorityTag;