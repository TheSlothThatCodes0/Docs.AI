import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.css";
import CustomToolbar from "./CustomToolbar";
import MenuButtons from "./MenuButtons";
import ShareAndProfile from "./ShareAndProfile";

const TextEditor = () => {
  const [value, setValue] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });
  const [modifiedText, setModifiedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);
  const [lastFetchedValue, setLastFetchedValue] = useState("");
  const quillRef = useRef(null);
  const promptRef = useRef(null);
  const modules = {
    toolbar: {
      container: "#toolbar",
    },
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (value !== lastFetchedValue) {
        const lastWords = value;
        fetchSuggestions(lastWords);
        setLastFetchedValue(value);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [value, lastFetchedValue]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Tab" && currentSuggestion) {
        event.preventDefault();
        const quill = quillRef.current.getEditor();
        var cursorPosition = quill.getSelection().index;
        cursorPosition -= 1;
        quill.insertText(cursorPosition, currentSuggestion);
        quill.setSelection(cursorPosition + currentSuggestion.length);

        setCurrentSuggestion("");
      }
      if (event.key === "/" && highlightedText) {
        event.preventDefault();
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        console.log("Slash pressed. Selection range:", range);
        setSelectionRange(range);
        const bounds = quill.getBounds(range.index, range.length);
        setPromptPosition({ top: bounds.bottom + 10, left: bounds.left });
        setShowPrompt(true);
        console.log("Setting showPrompt to true");
        setTimeout(() => promptRef.current?.focus(), 0);
      }
    },
    [currentSuggestion, highlightedText]
  );

  const handleTextSelect = () => {
    const quill = quillRef.current.getEditor();
    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      const text = quill.getText(selection.index, selection.length);
      console.log("Text selected:", text);
      setHighlightedText(text);
      setSelectionRange(selection);
      console.log("Selection range set:", selection);
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    console.log("handlePromptSubmit called");
    console.log("Current promptInput:", promptInput);
    console.log("Current highlightedText:", highlightedText);

    setIsLoading(true);
    try {
      const quill = quillRef.current.getEditor();
      const currentSelection = quill.getSelection();
      console.log("Current selection:", currentSelection);

      let textToModify =
        highlightedText ||
        (currentSelection
          ? quill.getText(currentSelection.index, currentSelection.length)
          : "");
      console.log("Text to modify:", textToModify);

      if (!textToModify) {
        console.warn("No text selected or highlighted. Using empty string.");
      }

      const response = await fetch("http://localhost:5001/api/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textToModify, prompt: promptInput }),
      });

      const data = await response.json();
      console.log("Received modified text:", data.modifiedText);
      setModifiedText(data.modifiedText);
      if (selectionRange) {
        setSelectionRange(selectionRange);
      }
    } catch (error) {
      console.error("Error modifying text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplace = () => {
    console.log("Replace button clicked");
    console.log("Current selection range:", selectionRange);
    console.log("Modified text:", modifiedText);

    if (selectionRange && modifiedText) {
      const quill = quillRef.current.getEditor();
      quill.deleteText(selectionRange.index, selectionRange.length);
      quill.insertText(selectionRange.index, modifiedText);
      quill.setSelection(selectionRange.index + modifiedText.length);
    } else {
      console.error(
        "Cannot replace text: selectionRange or modifiedText is missing"
      );
    }

    setShowPrompt(false);
    setPromptInput("");
    setModifiedText("");
    setSelectionRange(null);
  };

  useEffect(() => {
    console.log("Quill content updated:", value);
  }, [value]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          setValue(quill.root.innerHTML);
        }
      });
    }
  }, []);

  const handleDiscard = () => {
    setShowPrompt(false);
    setPromptInput("");
    setModifiedText("");
    setSelectionRange(null);
  };

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    quill.root.addEventListener("keydown", handleKeyDown);
    return () => {
      quill.root.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center pt-20 bg-gray-200 min-h-screen">
      <CustomToolbar />
      <MenuButtons />
      <ShareAndProfile />
      <div className="w-[8.5in] min-h-[11in] p-10 bg-white shadow-md border border-gray-200 overflow-hidden mt-10 z-10 rounded relative">
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={setValue}
          modules={modules}
          onChangeSelection={handleTextSelect}
        />

        {currentSuggestion && (
          <span className="text-gray-400 mt-2">{currentSuggestion}</span>
        )}

        {showPrompt && (
          <div
            // className="prompt-modal"
            className="bg-gray-400 bg-opacity-20 backdrop-blur-md p-2 shadow z-10 rounded-2xl"
            style={{
              position: "absolute",
              top: `${promptPosition.top+35}px`,
              left: `${promptPosition.left + 30}px`,
            }}
          >
            {console.log("Rendering prompt modal")}
            <form onSubmit={handlePromptSubmit}>
              <input
                ref={promptRef}
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter your modification"
                // className="prompt-input"
                className="bg-gray-500 bg-opacity-10 backdrop-blur-sm p-2 rounded-2xl text-md"
              />
              <button
                type="submit"
                // className="prompt-submit"
                className="bg-gray-500 bg-opacity-10 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-gray-500"
                onClick={() => console.log("Submit button clicked")}
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
              <button
                type="button"
                // className="prompt-cancel"
                className="bg-red-700 bg-opacity-10 p-1.5 rounded-2xl ml-2 text-md text-red-500"
                onClick={handleDiscard}
              >
                Cancel
              </button>
            </form>
            {modifiedText && (
              <div className="modified-text-container">
                <p className="modified-text">{modifiedText}</p>
                <button onClick={handleReplace} className="bg-gray-500 bg-opacity-10 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-gray-500">
                  Replace
                </button>
                <button onClick={handleDiscard} className="bg-red-700 bg-opacity-10 p-1.5 rounded-2xl ml-2 text-md text-red-500">
                  Discard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
