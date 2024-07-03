import React, { useState, useRef, useEffect } from 'react';
import AI from '../assets/AI.png';
import { useValue } from './TextEditor';
import "./title.css"

const AutoTitle = ({ title, setTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { filteredContent } = useValue();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [titlePosition, setTitlePosition] = useState('default');

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      adjustInputWidth(inputRef.current);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const initialTop = 96; // 24px (top) + 16px (p-4) = 40px, multiply by 2.4 for rem
        if (containerRect.top <= 0 && titlePosition !== 'fixed') {
          setTitlePosition('fixed');
        } else if (containerRect.top > 0 && window.scrollY < initialTop && titlePosition !== 'default') {
          setTitlePosition('default');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [titlePosition]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setTitle(e.target.value);
    adjustInputWidth(e.target);
  };

  const adjustInputWidth = (input) => {
    input.style.width = 'auto';
    input.style.width = `${Math.min(Math.max(input.scrollWidth, 100), 300)}px`;
  };

  const handleContainerBlur = (e) => {
    if (!containerRef.current.contains(e.relatedTarget)) {
      if (!title.trim()) {
        setTitle('Untitled Document');
      }
      setIsEditing(false);
    }
  };

  async function getAutoTitle(text) {
    try {
      const response = await fetch('http://34.16.205.25:5001/api/auto-title', {
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

  const handleAutoTitleClick = async (e) => {
    e.preventDefault(); 
    try {
      console.log('Generating auto title...');
      console.log("Filtered content:", filteredContent);
      if (filteredContent) {
        const autoTitle = await getAutoTitle(filteredContent);
        setTitle(autoTitle);
        if (inputRef.current) {
          adjustInputWidth(inputRef.current);
          inputRef.current.focus(); 
        }
      } else {
        console.log('No content to generate title from');
      }
    } catch (error) {
      console.error("Failed to fetch auto title:", error);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed top-6 left-16 p-1 flex items-center title-container"
      onBlur={handleContainerBlur}
      tabIndex="-1" 
    >
      <div className="title-wrapper">
        {isEditing ? (
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleInputChange}
              className="title-input"
            />
            <button 
              onClick={handleAutoTitleClick} 
              className="ai-button ml-2"
              onMouseDown={(e) => e.preventDefault()} 
            >
              <img src={AI} alt="Generate Title" />
            </button>
          </div>
        ) : (
          <h1 onClick={handleTitleClick} className="title-display">
            {title}
          </h1>
        )}
      </div>
    </div>
  );
};

export default AutoTitle;