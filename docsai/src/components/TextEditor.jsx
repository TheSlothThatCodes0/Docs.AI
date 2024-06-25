import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.css";
import CustomToolbar from "./CustomToolbar";
import MenuButtons from "./MenuButtons";
import ShareAndProfile from "./ShareAndProfile";
import AutoTitle from "./AutoTitle";
import ChatWindow from "./ChatWindow";

const ValueContext = createContext();
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
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [promptStart, setPromptStart] = useState(null);
 
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

  const exitPromptMode = useCallback(() => {
    console.log("Exiting prompt mode");
    const quill = quillRef.current.getEditor();
    quill.formatText(promptStart, quill.getLength() - promptStart, {
      color: "black",
    });
    setIsPromptMode(false);
    setPromptStart(null);
  }, [promptStart]);

  const handleTextChange = useCallback(
    (delta, oldDelta, source) => {
      console.log("Text changed, source:", source);
      if (source === "user") {
        const quill = quillRef.current.getEditor();
        setValue(quill.root.innerHTML);
        if (isPromptMode) {
          console.log("Formatting text in prompt mode");
          const currentPosition = quill.getSelection()
            ? quill.getSelection().index
            : quill.getLength();
          quill.formatText(promptStart, currentPosition - promptStart, {
            color: "blue",
          });
        }
      }
    },
    [isPromptMode, promptStart]
  );

  const generateParagraph = useCallback(
    async (prompt) => {
      try {
        console.log("Generating paragraph with prompt:", prompt);
        const response = await fetch(
          "http://localhost:5001/api/generate-paragraph",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Generated paragraph:", data.paragraph);
        const generatedParagraph = data.paragraph;

        const quill = quillRef.current.getEditor();
        quill.deleteText(promptStart, quill.getLength() - promptStart);
        quill.insertText(promptStart, generatedParagraph);
        quill.setSelection(promptStart + generatedParagraph.length);

        exitPromptMode();
      } catch (error) {
        console.error("Error generating paragraph:", error);
        alert("Failed to generate paragraph. Please try again.");
        exitPromptMode();
      }
    },
    [promptStart, exitPromptMode]
  );

  const generateImage = useCallback(
    async (prompt) => {
      try {
        console.log("Generating image with prompt:", prompt);
        const response = await fetch("http://localhost:5001/api/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const generatedImage = data.image; // stores the url of the image provided
        console.log("Generated image:", generatedImage);
        const imageResponse = await fetch(generatedImage); // downloads the image from the url provided
        console.log("Image response:", imageResponse);
        if (!imageResponse.ok) {
          throw new Error(`HTTP error! status: ${imageResponse.status}`);
        }

        const blob = await imageResponse.blob();
        const imageURL = URL.createObjectURL(blob); // stores the downloaded image in a URL object

        const quill = quillRef.current.getEditor();
        quill.deleteText(promptStart, quill.getLength() - promptStart); // removing the pormopt text
        quill.insertEmbed(promptStart, "image", imageURL); // inserting the image at the prompt position
        quill.setSelection(promptStart + 1);

        exitPromptMode();
      } catch (error) {
        console.error("Error generating image:", error);
        alert("Failed to generate image. Please try again.");
        exitPromptMode();
      }
    },
    [promptStart, exitPromptMode]
  );


  const handleKeyDown = useCallback(
    (event) => {
      console.log("Key pressed:", event.key);
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();
      console.log("Current selection:", selection);
  
      if (!isPromptMode && (event.key === "p" || event.key === "i")) {
        const position = selection ? selection.index : 0;
        const [leaf, offset] = quill.getLeaf(position);
        const leafText = leaf.text;
        console.log("Leaf text:", leafText, "Offset:", offset);
  
        if (offset > 0 && leafText[offset - 1] === "/") {
          console.log(`'/${event.key}' detected, entering prompt mode`);
          setIsPromptMode(true);
          setPromptStart(position - 1);
          quill.formatText(position - 1, 2, { color: "blue" });
          console.log("Prompt mode activated, start position:", position - 1);
        }
      } else if (event.key === "Enter" && isPromptMode) {
        console.log("Enter pressed in prompt mode");
        event.preventDefault();
        const promptEnd = quill.getSelection()
          ? quill.getSelection().index
          : quill.getLength();
        const promptText = quill
          .getText(promptStart, promptEnd - promptStart)
          .trim();
        console.log("Prompt text:", promptText);
  
        if (promptText.startsWith("/p ")) {
          console.log("Generating paragraph with prompt:", promptText.slice(3));
          generateParagraph(promptText.slice(3));
        } else if (promptText.startsWith("/i ")) {
          console.log("Generating image with prompt:", promptText.slice(3));
          generateImage(promptText.slice(3));
        } else {
          console.log("Invalid prompt, exiting prompt mode");
          exitPromptMode();
        }
      } else if (event.key === "Escape" && isPromptMode) {
        console.log("Escape pressed, exiting prompt mode");
        event.preventDefault();
        exitPromptMode();
      } else if (event.key === "Tab" && currentSuggestion) {
        event.preventDefault();
        var cursorPosition = quill.getSelection().index;
        cursorPosition -= 1;
        quill.insertText(cursorPosition, currentSuggestion);
        quill.setSelection(cursorPosition + currentSuggestion.length);
        setCurrentSuggestion("");
      } else if (event.key === "/" && highlightedText) {
        event.preventDefault();
        console.log(
          "Slash pressed with highlighted text. Selection range:",
          selection
        );
        setSelectionRange(selection);
        const bounds = quill.getBounds(selection.index, selection.length);
        setPromptPosition({ top: bounds.bottom + 10, left: bounds.left });
        setShowPrompt(true);
        console.log("Setting showPrompt to true");
        setTimeout(() => promptRef.current?.focus(), 0);
      }
    },
    [
      isPromptMode,
      promptStart,
      generateParagraph,
      generateImage,
      exitPromptMode,
      currentSuggestion,
      highlightedText,
    ]
  );

  const handleTextSelect = useCallback(() => {
    const quill = quillRef.current.getEditor();
    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      const text = quill.getText(selection.index, selection.length);
      console.log("Text selected:", text);
      setHighlightedText(text);
      setSelectionRange(selection);
      console.log("Selection range set:", selection);
    } else if (!showPrompt) {
      setHighlightedText("");
      setSelectionRange(null);
    }
  }, [showPrompt]);

  // this is the function for the text-selection prompt
  const handlePromptSubmit = async (e) => { 
    e.preventDefault();
    console.log("handlePromptSubmit called");
    console.log("Current promptInput:", promptInput);

    setIsLoading(true);
    try {
      const quill = quillRef.current.getEditor();
      const currentSelection = quill.getSelection() || selectionRange;
      console.log("Current selection:", currentSelection);

      let textToModify = currentSelection
        ? quill.getText(currentSelection.index, currentSelection.length)
        : highlightedText || "";
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
      if (currentSelection) {
        setSelectionRange(currentSelection);
      }
    } catch (error) {
      console.error("Error modifying text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // helper function to replace the text
  const handleReplace = useCallback(() => {
    console.log("Replace button clicked");
    const quill = quillRef.current.getEditor();
    const currentSelection = quill.getSelection() || selectionRange;
    console.log("Current selection range:", currentSelection);
    console.log("Modified text:", modifiedText);

    if (currentSelection && modifiedText) {
      quill.deleteText(currentSelection.index, currentSelection.length);
      quill.insertText(currentSelection.index, modifiedText);
      quill.setSelection(currentSelection.index + modifiedText.length);
      setValue(quill.root.innerHTML);
      setShowPrompt(false);
      setPromptInput("");
      setModifiedText("");
      setHighlightedText("");
      setSelectionRange(null);
    } else {
      console.error(
        "Cannot replace text: selection range or modifiedText is missing",
        { currentSelection, modifiedText }
      );
    }
  }, [selectionRange, modifiedText, setValue]);

  useEffect(() => {
    console.log("Quill content updated:", value);
  }, [value]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("selection-change", handleTextSelect);
      return () => {
        quill.off("selection-change", handleTextSelect);
      };
    }
  }, [handleTextSelect]);

  //-----------------------------DO NOT CHANGE ANYTHING BELOW THIS----------------------------------------------------------------

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("text-change", handleTextChange);
      quill.on("selection-change", handleTextSelect);
      quill.root.addEventListener("keydown", handleKeyDown);
      return () => {
        quill.off("text-change", handleTextChange);
        quill.off("selection-change", handleTextSelect);
        quill.root.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown, handleTextChange, handleTextSelect, handleReplace]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const handleTextChange = (delta, oldDelta, source) => {
        console.log("Text changed, source:", source);
        if (source === "user") {
          setValue(quill.root.innerHTML);
          if (isPromptMode) {
            console.log("Formatting text in prompt mode");
            const currentPosition = quill.getSelection()
              ? quill.getSelection().index
              : quill.getLength();
            quill.formatText(promptStart, currentPosition - promptStart, {
              color: "blue",
            });
          }
        }
      };
      quill.on("text-change", handleTextChange);
      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [isPromptMode, promptStart, setValue]);

  //-------------------------------DO NOT CHANGE ANYTHING ABOVE THIS-----------------------------------------------------------------------------

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
    <ValueContext.Provider value={value}>
      <div className="flex flex-col items-center pt-20 bg-gray-200 min-h-screen">
        <AutoTitle />
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
                top: `${promptPosition.top + 35}px`,
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
                  <button
                    onClick={() => {
                      console.log("Replace button clicked in JSX");
                      const quill = quillRef.current.getEditor();
                      const currentSelection =
                        quill.getSelection() || selectionRange;
                      console.log("Current selection range:", currentSelection);
                      console.log("Current modified text:", modifiedText);
                      handleReplace();
                    }}
                    className="bg-gray-500 bg-opacity-10 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-gray-500"
                  >
                    Replace
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="bg-red-700 bg-opacity-10 p-1.5 rounded-2xl ml-2 text-md text-red-500"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


   
      <ChatWindow />
    </div>

    </ValueContext.Provider>
  );
};

export default TextEditor;
export const useValue = () => useContext(ValueContext);
