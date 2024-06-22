import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.css";
import CustomToolbar from "./CustomToolbar";

const TextEditor = () => {
  const [value, setValue] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const quillRef = useRef(null);

  const modules = {
    toolbar: {
      container: "#toolbar",
    },
  };

  // Function to fetch suggestions from backend
  const fetchSuggestions = async (text) => {
    try {
      const response = await fetch("http://localhost:5001/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      console.log("Suggestions:", data.suggestions);

      if (data.suggestions.length > 0) {
        // Extract the first suggestion
        const plainSuggestion = data.suggestions;
        setCurrentSuggestion(plainSuggestion);
      } else {
        setCurrentSuggestion("");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setCurrentSuggestion("");
    }
  };

  // Effect to fetch suggestions when value changes
  useEffect(() => {
    if (value != "") {
      const lastWords = value.split(" ").slice(-5).join(" "); // Send only the last 5 words for suggestions
      fetchSuggestions(lastWords);
    }
  }, [value]);

  // Handle Tab key press to insert suggestion
  const handleKeyDown = (event) => {
    if (event.key === "Tab" && currentSuggestion) {
      event.preventDefault();
      const quill = quillRef.current.getEditor();
      const cursorPosition = quill.getSelection().index;

      quill.insertText(cursorPosition, currentSuggestion);
      quill.setSelection(cursorPosition + currentSuggestion.length);

      setCurrentSuggestion("");
    }
  };

  return (
    <div className="flex flex-col items-center pt-20 bg-gray-200 min-h-screen">
      <CustomToolbar />
      <div className="w-[8.5in] min-h-[11in] p-10 bg-white shadow-md border border-gray-200 overflow-hidden mt-10 rounded relative">
        <div className="flex felx-row-wrap">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={setValue}
            modules={modules}
            onKeyDown={handleKeyDown}
          />

          {currentSuggestion && (
            // <div className="suggestion-overlay">
            <span className="text-gray-400 mt-2">{currentSuggestion}</span>
            // </div>
          )}
        </div>
      </div>
    </div>  
  );
};

export default TextEditor;
