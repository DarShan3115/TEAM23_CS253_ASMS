import React from 'react';

const StatusChip = ({ status }) => {
  const colors = {
    Pending: 'text-yellow-400 bg-yellow-400/10',
    Submitted: 'text-green-400 bg-green-400/10',
    Overdue: 'text-red-400 bg-red-400/10',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 ${colors[status] || 'text-gray-400 bg-gray-800'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Submitted' ? 'bg-green-400' : status === 'Overdue' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
      {status}
    </span>
  );
};

export default StatusChip;