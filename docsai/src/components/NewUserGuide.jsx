import React, { useState } from 'react';
import { X } from 'lucide-react';

const NewUserGuide = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors w-11 h-11"
      >
        <span className="sr-only">Open guide</span>
        ?
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 bg-white shadow-lg rounded-lg p-6 max-w-md w-1/3">
      <div className="flex flex-col">
        <p className="mb-4 text-lg">Try and use our AI features to edit your documents:</p>
        <ul className="list-disc pl-6 space-y-3 text-lg mb-12">
          <li>Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">/p</span> before any sentence to make it a prompt.</li>
          <li>Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">/i</span> before any sentence to make it an image prompt.</li>
          <li>Select any portion of the text and press <span className="font-mono bg-gray-100 px-2 py-1 rounded">/</span> to modify it using AI.</li>
          <li>Try and use the AutoTitle feature when you try to rename your document on the top left.</li>
        </ul>
        <button
          onClick={() => setIsOpen(false)}
          className="fixed bottom-4 left-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NewUserGuide;