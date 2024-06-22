import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './editor.css';
import CustomToolbar from './CustomToolbar';

const TextEditor = () => {
  const [value, setValue] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const quillRef = useRef(null);

  const modules = {
    toolbar: {
      container: "#toolbar"
    }
  };

  const fetchSuggestions = async (text) => {
    try {
      console.log('Sending text for suggestions:', text);

      const response = await fetch('http://localhost:5001/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      console.log('Suggestions received:', data.suggestions);

      if (data.suggestions.length > 0) {
        const plainSuggestion = data.suggestions[0].replace(/<\/?[^>]+(>|$)/g, "").replace(/['"]/g, "");
        setCurrentSuggestion(plainSuggestion);
      } else {
        setCurrentSuggestion('');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setCurrentSuggestion('');
    }
  };

  useEffect(() => {
    if (value) {
      const lastWord = value.split(' ').pop(); 
      fetchSuggestions(lastWord);
    }
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && currentSuggestion) {
      event.preventDefault();
      const quill = quillRef.current.getEditor();
      const cursorPosition = quill.getSelection()?.index;

      if (cursorPosition !== undefined) {
        quill.insertText(cursorPosition, currentSuggestion);
        quill.setSelection(cursorPosition + currentSuggestion.length);
        setCurrentSuggestion('');
      }
    }
  };

  return (
    <div className="flex flex-col items-center pt-20 bg-gray-200 min-h-screen">
      <CustomToolbar />
      <div className="w-[8.5in] min-h-[11in] p-10 bg-white shadow-md border border-gray-200 overflow-hidden mt-10 rounded relative">
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={setValue}
          modules={modules}
          onKeyDown={handleKeyDown}
        />
        {currentSuggestion && (
          <div 
            className="suggestion-overlay"
            style={{ 
              position: 'absolute', 
              color: 'gray',
              pointerEvents: 'none',
              opacity: 0.5,
              top: '10px', 
              left: '5px', 
            }}
          >
            {currentSuggestion}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
