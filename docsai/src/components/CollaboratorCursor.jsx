import React, { useEffect, useRef, useState } from "react";

const CollaboratorCursor = ({ userId, position, quillRef, color, userName }) => {
  const cursorRef = useRef(null);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const updateCursorPosition = () => {
      if (position && quillRef.current && cursorRef.current) {
        const quill = quillRef.current.getEditor();
        const { index } = position;
        const bounds = quill.getBounds(index);
        const cursorEl = cursorRef.current;
        const editorBounds = quill.container.getBoundingClientRect();
        const scrollingContainer = quill.scrollingContainer;

        if (bounds) {
          const scrollTop = scrollingContainer.scrollTop;
          const scrollLeft = scrollingContainer.scrollLeft;

          // Calculate positions relative to the Quill container
          const top = bounds.top - scrollTop;
          const left = bounds.left - scrollLeft;

          // Set cursor position
          cursorEl.style.transform = `translate(${left}px, ${top}px)`;
          cursorEl.style.height = `${bounds.height}px`;

          // Update debug info
          setDebug({ bounds, top, left, scrollTop, scrollLeft });
        }
      }
    };

    const quill = quillRef.current.getEditor();
    const scrollingContainer = quill.scrollingContainer;

    const handleTextChange = () => {
      updateCursorPosition();
    };

    const handleScroll = () => {
      updateCursorPosition();
    };

    quill.on("text-change", handleTextChange);
    scrollingContainer.addEventListener("scroll", handleScroll);

    // Initial position update
    updateCursorPosition();

    return () => {
      quill.off("text-change", handleTextChange);
      scrollingContainer.removeEventListener("scroll", handleScroll);
    };
  }, [position, quillRef]);

  return (
    <>
      <div
        ref={cursorRef}
        className="absolute top-10 left-10 z-20 flex items-center pointer-events-none"
        style={{ transition: 'transform 0.1s' }}
      >
        <div
          className="w-0.5 rounded-sm"
          style={{ backgroundColor: color, height: 'inherit' }}
        />
        <div
          className="ml-1 px-1 py-0.5 text-xs text-white rounded whitespace-nowrap mt-8"
          style={{ backgroundColor: color }}
        >
          {userName}
        </div>
      </div>
    </>
  );
};

export default CollaboratorCursor;