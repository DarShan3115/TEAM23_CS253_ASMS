import React from 'react';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-blue-600' : 'bg-gray-700'
    }`}
  >
    <span
      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default ToggleSwitch;