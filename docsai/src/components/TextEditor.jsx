// src/components/Editor.js
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Editor = () => {
  const [value, setValue] = useState('');

  return (
    <div>
      <ReactQuill value={value} onChange={setValue} />
      <div>
        <h3>Content:</h3>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </div>
    </div>
  );
};

export default Editor;
