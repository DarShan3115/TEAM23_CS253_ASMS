import React from 'react';
import { Award } from 'lucide-react';

const CreditBadge = ({ credits }) => (
  <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
    <Award size={12} />
    {credits} Credits
  </span>
);

export default CreditBadge;