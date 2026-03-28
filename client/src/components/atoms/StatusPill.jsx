import React from 'react';

const StatusPill = ({ active }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
    active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
  }`}>
    {active ? 'Active' : 'Suspended'}
  </span>
);

export default StatusPill;