import React from 'react';

const FeedbackButton = ({ url }) => {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bg-white text-black hover:bg-gray-100 px-4 py-2 rounded bottom-5 left-24 text-sm font-medium"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
    >
      Feedback
    </button>
  );
};

export default FeedbackButton;