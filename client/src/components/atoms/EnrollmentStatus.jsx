import React from 'react';

const EnrollmentStatus = ({ status }) => {
  const styles = {
    enrolled: 'bg-green-500/10 text-green-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    default: 'bg-gray-700 text-gray-400'
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.default}`}>
      {status}
    </span>
  );
};

export default EnrollmentStatus;