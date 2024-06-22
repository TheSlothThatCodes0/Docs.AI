import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './editor.css';
import CustomToolbar from './CustomToolbar';

const TextEditor = () => {
  const [value, setValue] = useState('');

  const modules = {
    toolbar: {
      container: "#toolbar"
    }
  };

  return (
    <div className=" flex flex-col items-center pt-20 bg-gray-200 min-h-screen">
      <CustomToolbar />
      <div className="w-[8.5in] min-h-[11in] p-10 bg-white shadow-md border border-gray-200 overflow-hidden mt-10 rounded">
        <ReactQuill value={value} onChange={setValue} modules={modules} />
      </div>
    </div>
  );
};

export default TextEditor;
