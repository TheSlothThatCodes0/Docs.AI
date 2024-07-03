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
    <div className="fixed bottom-16 left-4 bg-white border shadow-lg rounded-lg p-6 max-w-md w-1/3 z-50">
      <div className="flex flex-col">
        <p className="mb-4 text-md">Try and use built-in AI features to edit your documents:</p>
        <ul className="list-disc pl-6 space-y-3 text-md">
          <li>Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">/p</span> before any sentence to make it a prompt, press escape to exit prompting mode.</li>
          <li>Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">/i</span> before any sentence to make it an image prompt, press escape to exit prompting mode.</li>
          <li>Select any portion of the text and press <span className="font-mono bg-gray-100 px-2 py-1 rounded">/</span> to modify it using AI.</li>
          <li>Use the AutoTitle feature when you try to rename your document on the top left after adding some content.</li>
          <li>Look for autocomplete suggestions below your cursor and press tab to use them.</li>   
          <li>Use the chat window at the bottom right to ask any questions from your document's content.</li>
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