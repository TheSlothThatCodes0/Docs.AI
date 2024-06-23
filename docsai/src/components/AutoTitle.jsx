import React, { useState, useEffect, useRef } from 'react';
import AI from '../assets/AI.png';
import { useValue } from './TextEditor';

const AutoTitle = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const value = useValue();
  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setTitle(e.target.value);
    console.log('value', value)
  };

  const handleInputBlur = () => {
    if (!title.trim()) {
      setTitle('Untitled Document');
    }
    setIsEditing(false);
  };

  async function getAutoTitle(text) {
    try {
      const response = await fetch('http://localhost:5001/api/auto-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error('Error fetching auto-generated title:', error);
      throw error;
    }
  }

  const handleAutoTitleClick = async () => {
    try {
      console.log('Generating auto title...')
      console.log("value:", value)
      if (value) {
        const autoTitle = await getAutoTitle(value); 
        setTitle(autoTitle);
      } else {
        console.log('No content to generate title from');
      }
    } catch (error) {
      console.error("Failed to fetch auto title:", error);
    }
  };

  return (
    <div className="absolute top-2 left-2 p-4 flex items-center">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          autoFocus
          className="text-left"
        />
      ) : (
        <h1 onClick={handleTitleClick} className="cursor-pointer">
          {title}
        </h1>
      )}
  
      <button onClick={handleAutoTitleClick} className="ml-2">
        <img className='h-9 w-10 mt-1 -ml-1' src={AI} alt="Generate Title" />
      </button>
    </div>
  );
};

export default AutoTitle;
