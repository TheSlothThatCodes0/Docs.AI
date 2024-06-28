import React, { useState, useEffect } from 'react';

const AutoSave = ({ onAutoSaveChange, initialState = true }) => {
  const [enabled, setEnabled] = useState(initialState);

  useEffect(() => {
    onAutoSaveChange(enabled);
  }, [enabled, onAutoSaveChange]);

  const toggleSwitch = () => {
    setEnabled(prevState => !prevState);
  };

  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={enabled}
            onChange={toggleSwitch}
          />
          <div 
            className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              enabled ? 'bg-blue-600' : 'bg-white border-2 border-gray-300'
            }`}
          ></div>
          <div 
            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
              enabled ? 'transform translate-x-4 shadow-md' : 'bg-gray-400'
            }`}
          ></div>
        </div>
        <div className="ml-3 text-sm font-medium text-gray-700">
          AutoSave
        </div>
      </label>
    </div>
  );
};

export default AutoSave;