import React, { useEffect, useRef } from "react";

const CollaboratorCursor = ({ userId, position, quillRef, color, userName }) => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const updateCursorPosition = () => {
      if (position && quillRef.current) {
        const quill = quillRef.current.getEditor();
        const { index } = position;
        const bounds = quill.getBounds(index);
        const cursorEl = cursorRef.current;
        const editorBounds = quill.container.getBoundingClientRect();

        if (bounds && cursorEl) {
          cursorEl.style.top = `${bounds.top + editorBounds.top}px`;
          cursorEl.style.left = `${bounds.left + editorBounds.left}px`;
          cursorEl.style.height = `${bounds.height}px`;
        }
      }
    };

    updateCursorPosition();

    const quill = quillRef.current.getEditor();
    quill.on('text-change', updateCursorPosition);

    return () => {
      quill.off('text-change', updateCursorPosition);
    };
  }, [position, quillRef]);

  return (
    <div
      ref={cursorRef}
      className="fixed z-20 flex items-center pointer-events-none"
    >
      <div
        className="w-0.5 h-5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <div
        className="ml-1 mb-8 px-1 py-0.5 text-xs text-white rounded"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    </div>
  );
};

export default CollaboratorCursor;