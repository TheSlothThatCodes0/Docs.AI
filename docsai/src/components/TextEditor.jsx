import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  createContext,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.css";
import CustomToolbar from "./CustomToolbar";
import MenuButtons from "./MenuButtons";
import ShareAndProfile from "./SaveAndProfile";
import AutoTitle from "./AutoTitle";
import ChatWindow from "./ChatWindow";
import { storage } from "./Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { toPng } from "html-to-image";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import Delta from "quill-delta";
import CollaboratorCursor from "./CollaboratorCursor";
import { useNavigate } from "react-router-dom";
import NewUserGuide from "./NewUserGuide";
import { Bold } from "lucide-react";
import PopupFeedbackForm from "./PopupFeedbackForm";

const auth = getAuth();
const ValueContext = createContext();

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", "#B39DDB",
  "#4DB6AC", "#FF8A65", "#BA68C8", "#FFD54F", "#81C784"
];

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
  const [filteredContent, setFilteredContent] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const location = useLocation();
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isContentChanged, setIsContentChanged] = useState(false);
  const [userID, setUserID] = useState("");
  const [fileName, setFileName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserID, setCurrentUserID] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [collaboratorCursors, setCollaboratorCursors] = useState({});
  const [userNames, setUserNames] = useState({});
  const [userColors, setUserColors] = useState({});
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const autoSaveIntervalRef = useRef(null);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const colorIndexRef = useRef(0);
  const navigate = useNavigate();
  
  const modules = {
    toolbar: {
      container: "#toolbar",
    },
  };


  const getNextColor = useCallback(() => {
    const color = COLORS[colorIndexRef.current];
    colorIndexRef.current = (colorIndexRef.current + 1) % COLORS.length;
    return color;
  }, []);

  const fetchSuggestions = async (text) => {
    try {
      const response = await fetch("http://34.16.205.25:5001/api/suggestions", {
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

  const handleAutoSaveChange = (enabled) => {
    setAutoSaveEnabled(enabled);
  };

  const filterContent = useCallback((content) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const imgs = tempDiv.getElementsByTagName("img");
    while (imgs.length > 0) {
      imgs[0].parentNode.removeChild(imgs[0]);
    }

    return tempDiv.innerText;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserID(user.uid);
        user.displayName !== null
          ? setCurrentUsername(user.displayName)
          : setCurrentUsername("Anonymous");
        console.log("User ID set by setter:", currentUserID);
        console.log("User name set by setter:", currentUsername);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = filterContent(value);
    setFilteredContent(filtered);
  }, [value, filterContent]);

  useEffect(() => {
    if (location.state && location.state.content) {
      const quill = quillRef.current.getEditor();
      quill.setContents(location.state.content);
      setValue(quill.root.innerHTML);
      if (location.state.title) {
        setTitle(location.state.title);
      }
      setDocPath(location.state.docPath);
      console.log("Document content loaded from location state");
    }
  }, [location]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const URL_userID = queryParams.get("userID");
    const URL_fileName = queryParams.get("fileName");
    
    if (URL_userID !== null && URL_fileName != null) {
      setDocPath(`users/${URL_userID}/documents/${URL_fileName}`);
      setUserID(URL_userID);
      setFileName(URL_fileName);
      loadFileContent(URL_userID, URL_fileName);

      const socket = io("http://34.16.205.25:8080");
      socketRef.current = socket;

      const room = `${URL_userID}-${URL_fileName}`;
      socket.emit("join-room", room);

      socket.on("connect", () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      });

      socket.on("document-change", (delta) => {
        console.log("Received delta:", delta);
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          quill.updateContents(delta);
        }
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("cursor-position", (data) => {
        const { userId, position, userName } = data;
        setCollaboratorCursors((prevCursors) => ({
          ...prevCursors,
          [userId]: position,
        }));

        if (!userNames[userId]) {
          setUserNames((prevNames) => ({
            ...prevNames,
            [userId]: userName,
          }));
        }

        setUserColors((prevColors) => {
          if (!prevColors[userId]) {
            return {
              ...prevColors,
              [userId]: getNextColor(),
            };
          }
          return prevColors;
        });

      });

      return () => {
        socket.disconnect();
      };
    }
  }, [getNextColor]);

  useEffect(() => {
    if (quillRef.current && isConnected) {
      const quill = quillRef.current.getEditor();

      const handleTextChange = (delta, oldContents, source) => {
        if (source === "user" && socketRef.current) {
          const room = `${userID}-${fileName}`;
          socketRef.current.emit("document-change", { room, delta });
        }
        
        // Update cursor position after text change
        const range = quill.getSelection();
        if (range) {
          const room = `${userID}-${fileName}`;
          socketRef.current.emit("cursor-position", {
            room,
            userId: currentUserID,
            userName: currentUsername,
            position: range,
          });
        }
      };

      quill.on("text-change", handleTextChange);

      const throttle = (func, delay) => {
        let timeoutId = null;
        return (...args) => {
          if (!timeoutId) {
            func(...args);
            timeoutId = setTimeout(() => {
              timeoutId = null;
            }, delay);
          }
        };
      };

      const handleCursorChange = throttle((range, oldRange, source) => {
        if (range && socketRef.current && isConnected) {
          const room = `${userID}-${fileName}`;
          socketRef.current.emit("cursor-position", {
            room,
            userId: currentUserID,
            userName: currentUsername,
            position: range,
          });
        }
      }, 100);

      quill.on("selection-change", handleCursorChange);

      return () => {
        quill.off("text-change", handleTextChange);
        quill.off("selection-change", handleCursorChange);
      };
    }
  }, [currentUserID, userID, fileName, isConnected, quillRef, socketRef]);

  const loadFileContent = async (userID, fileName) => {
    try {
      const filePath = `users/${userID}/documents/${fileName}/file_contents.json`;
      const fileRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);

      const response = await fetch(downloadURL);
      const contentJson = await response.json();

      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        quill.setContents(contentJson);
        setValue(quill.root.innerHTML);
      }

      const metadataPath = `users/${userID}/documents/${fileName}/metadata.json`;
      const metadataRef = ref(storage, metadataPath);
      const metadataURL = await getDownloadURL(metadataRef);
      const metadataResponse = await fetch(metadataURL);
      const metadata = await metadataResponse.json();
      setTitle(metadata.title || "Untitled Document");

      console.log("File content loaded successfully");
    } catch (error) {
      console.error("Error loading file content:", error);
      alert("Failed to load the document. Please try again.");
    }
  };

  useEffect(() => {
    const quill = quillRef.current.getEditor();

    if (isConnected) {
      quill.on("text-change", (delta, oldDelta, source) => {
        console.log("Text changed, source:", source);
        if (source === "user") {
          const message = { room: socketRef.current.room, delta };
          socketRef.current.emit("document-change", message);
        }
      });
    }
    return () => {
      quill.off();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (value !== lastFetchedValue) {
        const quill = quillRef.current.getEditor();
        const delta = quill.getContents();
        
        const extractTextContent = (delta) => {
          return delta.ops.reduce((text, op) => {
            if (typeof op.insert === 'string') {
              return text + op.insert;
            }
            return text;
          }, '');
        };

        const fullText = extractTextContent(delta);
        const words = fullText.split(/\s+/);

        if (words.length > 10) {
          const context = words.join(' ').trim();
          
          fetchSuggestions(context);
          setLastFetchedValue(value);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [value, lastFetchedValue]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.focus();
      quill.setSelection(0, 0);
    }
  }, []);

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
      if (source === "user") {
        const quill = quillRef.current.getEditor();
        console.log("Text changed, source:", source);
        setValue(quill.root.innerHTML);
        setIsContentChanged(true);
        if (isPromptMode) {
          console.log("Formatting text in prompt mode");
          const currentPosition = quill.getSelection()
            ? quill.getSelection().index
            : quill.getLength();
          quill.formatText(promptStart, currentPosition - promptStart, {
            color: "#775599",
            Bold: true,
            italic: true,
          });
        }
      }
    },
    [isPromptMode, promptStart, setValue]
  );

  const generateParagraph = useCallback(
    async (prompt) => {
      try {
        console.log("Generating paragraph with prompt:", prompt);
        const response = await fetch(
          "http://34.16.205.25:5001/api/generate-paragraph",
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
        
        // Delete the prompt text
        quill.deleteText(promptStart, quill.getLength() - promptStart);
        
        // Insert the generated paragraph with normal formatting
        quill.insertText(promptStart, generatedParagraph, {
          color: 'black',
          bold: false,
          italic: false
        });
  
        const delta = new Delta()
          .retain(promptStart)
          .delete(quill.getLength() - promptStart)
          .insert(generatedParagraph, {
            color: 'black',
            bold: false,
            italic: false
          });
  
        if (socketRef.current && isConnected) {
          const room = `${userID}-${fileName}`;
          socketRef.current.emit("document-change", { room, delta });
        }
  
        exitPromptMode();
      } catch (error) {
        console.error("Error generating paragraph:", error);
        alert("Failed to generate paragraph. Please try again.");
        exitPromptMode();
      }
    },
    [promptStart, exitPromptMode, userID, fileName, isConnected]
  );

  const generateImage = useCallback(
    async (prompt) => {
      try {
        console.log("Generating image with prompt:", prompt);
        const response = await fetch("http://34.16.205.25:5001/api/image", {
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
        const generatedImage = data.image;

        const proxyUrl = `http://34.16.205.25:5002/proxy?url=${encodeURIComponent(
          generatedImage
        )}`;

        const imageResponse = await fetch(proxyUrl);
        if (!imageResponse.ok) {
          throw new Error(`HTTP error! status: ${imageResponse.status}`);
        }

        const blob = await imageResponse.blob();
        const imageBitmap = await createImageBitmap(blob);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const maxWidth = 500;
        const scale = maxWidth / imageBitmap.width;
        canvas.width = maxWidth;
        canvas.height = imageBitmap.height * scale;

        context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
        const resizedImageDataUrl = canvas.toDataURL("image/jpeg", 0.7);

        const quill = quillRef.current.getEditor();

        quill.deleteText(promptStart, "Processing...".length);
        const delta = new Delta()
          .retain(promptStart)
          .delete("Processing...".length)
          .insert({ image: resizedImageDataUrl });

        quill.updateContents(delta);
        if (socketRef.current && isConnected) {
          const room = `${userID}-${fileName}`;
          socketRef.current.emit("document-change", { room, delta });
        }

        exitPromptMode();
      } catch (error) {
        console.error("Error generating image:", error);
        alert("Failed to generate image. Please try again.");
        exitPromptMode();
      }
    },
    [promptStart, exitPromptMode, userID, fileName, isConnected]
  );
  const handleKeyDown = useCallback(
    (event) => {
      // console.log("Key pressed:", event.key);
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();
      // console.log("Current selection:", selection);

      if (!isPromptMode && (event.key === "p" || event.key === "i")) {
        const position = selection ? selection.index : 0;
        const [leaf, offset] = quill.getLeaf(position);
        const leafText = leaf.text;
        // console.log("Leaf text:", leafText, "Offset:", offset);

        if (offset > 0 && leafText[offset - 1] === "/") {
          console.log(`'/${event.key}' detected, entering prompt mode`);
          setIsPromptMode(true);
          setPromptStart(position - 1);
          quill.formatText(position - 1, 2, { color: "#775599", bold: true, italic: true });
          quill.formatText(position + 1, quill.getLength() - position - 1, { color: "black", bold: false, italic: false });
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

        // deleting the pormpt text
        quill.deleteText(promptStart, promptEnd - promptStart);

        // inserting the "processing" message
        quill.insertText(promptStart, "Processing...", { color: "gray", italic: true});
        setIsProcessingPrompt(true);

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

      const response = await fetch("http://34.16.205.25:5001/api/modify", {
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

  const handleEditorClick = () => {
    const quill = quillRef.current.getEditor();
    quill.focus();
  };

  useEffect(() => {
    const editorContainer = editorRef.current;
    if (editorContainer) {
      editorContainer.addEventListener("click", handleEditorClick);
      return () => {
        editorContainer.removeEventListener("click", handleEditorClick);
      };
    }
  }, []);

  // helper function to replace the text
  const handleReplace = useCallback(() => {
    console.log("Replace button clicked");
    const quill = quillRef.current.getEditor();
    const currentSelection = quill.getSelection() || selectionRange;
    console.log("Current selection range:", currentSelection);
    console.log("Modified text:", modifiedText);

    if (currentSelection && modifiedText) {
      const delta = new Delta()
        .retain(currentSelection.index)
        .delete(currentSelection.length)
        .insert(modifiedText);

      quill.updateContents(delta);
      quill.setSelection(currentSelection.index + modifiedText.length);
      setValue(quill.root.innerHTML);

      // Emit the change to other collaborators
      if (socketRef.current && isConnected) {
        const room = `${userID}-${fileName}`;
        socketRef.current.emit("document-change", { room, delta });
      }

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
  }, [selectionRange, modifiedText, setValue, userID, fileName, isConnected]);

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
              color: "#775599",
              bold: true,
              italic: true,
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

  const [docPath, setDocPath] = useState(null);

  const handleSave = useCallback(async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (userID === "") {
          setUserID(user.uid);
        }
        
        setCurrentUserID(user.uid);
        console.log("User ID:", user.uid);
        const quill = quillRef.current.getEditor();
        const delta = quill.getContents();
        const contentBlob = new Blob([JSON.stringify(delta)], {
          type: "application/json",
        });
        const metadata = { title: title, userID: user.uid, fileName: fileName, docPath: docPath};
        const currentDate = new Date();
        const editorElement = document.querySelector(".ql-editor");

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = editorElement.innerHTML;
        tempDiv.style.width = "500px";
        tempDiv.style.height = "600px";
        tempDiv.style.overflow = "hidden";

        document.body.appendChild(tempDiv);

        try {
          console.log("Creating thumbnail...");
          const thumbnailDataUrl = await toPng(tempDiv, { quality: 0.3 });
          const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob();
          const metadataBlob = new Blob([JSON.stringify(metadata)], {
            type: "application/json",
          });
          const formattedDateTime = `${currentDate.getFullYear()}${(
            "0" +
            (currentDate.getMonth() + 1)
          ).slice(-2)}${("0" + currentDate.getDate()).slice(-2)}_${(
            "0" + currentDate.getHours()
          ).slice(-2)}${("0" + currentDate.getMinutes()).slice(-2)}${(
            "0" + currentDate.getSeconds()
          ).slice(-2)}`;
          if (fileName == "") {
            setFileName(formattedDateTime);
          }
          

          const basePath =
            docPath || `users/${user.uid}/documents/${formattedDateTime}`;
          const contentRef = ref(storage, `${basePath}/file_contents.json`);
          const thumbnailRef = ref(storage, `${basePath}/file_thumbnail.png`);
          const metadataRef = ref(storage, `${basePath}/metadata.json`);
          document.body.removeChild(tempDiv);

          console.log("Uploading content...");
          await uploadBytes(contentRef, contentBlob);
          console.log("Uploading thumbnail...");
          await uploadBytes(thumbnailRef, thumbnailBlob);
          console.log("Uploading metadata...");
          await uploadBytes(metadataRef, metadataBlob);

          if (!docPath) {
            setDocPath(basePath);
          }

          // alert("Document and thumbnail saved successfully!");
          setIsContentChanged(false); // Reset content changed flag after save
        } catch (error) {
          console.error("Error during save operation:", error);
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
          alert("Failed to save document and thumbnail. Please try again.");
        }
      } else {
        console.log("User is not authenticated.");
      }
    });
  }, [title, docPath]);

  useEffect(() => {
    if (autoSaveEnabled) {
      console.log("Auto-save enabled");
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      autoSaveIntervalRef.current = setInterval(() => {
        if (isContentChanged) {
          console.log("Content changed detected. Saving document...");
          handleSave();
          setIsContentChanged(false); // Reset the content changed flag after saving
        }
      }, 5000); // 2 minutes
    } else {
      console.log("Auto-save disabled");
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveEnabled, isContentChanged, handleSave]);

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    const handleTextChange = () => {
      // console.log("Text changed");
      setIsContentChanged(true);
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    quill.root.addEventListener("keydown", handleKeyDown);
    return () => {
      quill.root.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <ValueContext.Provider
      value={{
        fullContent: value,
        filteredContent,
        title,
        quillRef,
        userID: userID,
        fileName,
        docPath
      }}
    >
      
      
       <div className="bg-gray-200 flex " onClick={() => navigate('/files')} >
        
       <img src={require('../assets/logo_home.png')} alt = 'logo' className = " h-12 w-auto top-5 left-5 fixed" />
       
       </div>
      <div className="flex flex-col items-center pt-20 bg-gray-200 min-h-screen">

        <NewUserGuide />
        <PopupFeedbackForm url="https://forms.gle/d3EXasr4NczneG6CA" />
        <AutoTitle
          content={filteredContent}
          title={title}
          setTitle={setTitle}
        />
        <CustomToolbar />
        <MenuButtons quillRef={quillRef} />
        <ShareAndProfile
          handleSave={handleSave}
          onAutoSaveChange={handleAutoSaveChange}
        />

        <div
          ref={editorRef}
          className="w-[8.5in] min-h-[11in] p-10 bg-white shadow-md border border-gray-200 overflow-hidden mt-10 z-10 mb-5 rounded relative"
        >
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={setValue}
            modules={modules}
            onChangeSelection={handleTextSelect}
          />

          {Object.entries(collaboratorCursors).map(([userId, position]) => (
            <CollaboratorCursor
              key={userId}
              userId={userId}
              position={position}
              quillRef={quillRef}
              color={userColors[userId]}
              userName={userNames[userId]}
            />
          ))}

          {currentSuggestion && (
            <span className="text-gray-400 mt-2">{currentSuggestion}</span>
          )}
        </div>

        {showPrompt && (
            <div
              // className="prompt-modal"
              className=" fixed z-50 bg-gray-400 bg-opacity-30 backdrop-blur-lg p-2 shadow-lg z-10 rounded-2xl"
              style={{
                position: "absolute",
                top: `${promptPosition.top + 160}px`,
                left: `${promptPosition.left + 300}px`,
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
                  className="bg-gray-400 bg-opacity-20 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-gray-600"
                  onClick={() => console.log("Submit button clicked")}
                >
                  {isLoading ? "Loading..." : "Submit"}
                </button>
                <button
                  type="button"
                  // className="prompt-cancel"
                  className="bg-red-700 bg-opacity-40 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-red-300"
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
                    className="bg-gray-400 bg-opacity-20 backdrop-blur-sm p-1.5 rounded-2xl ml-2 text-md text-gray-600"
                  >
                    Replace
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="bg-red-700 bg-opacity-40 p-1.5 rounded-2xl ml-2 text-md text-red-300"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          )}
        <ChatWindow content={filteredContent} />
      </div>
    </ValueContext.Provider>
  );
};

export default TextEditor;
export const useValue = () => useContext(ValueContext);
