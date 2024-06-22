"use client";

import { EditorContent, EditorRoot, useEditor } from "novel";
import { useState } from "react";


const TestPage = () => {
  const [content, setContent] = useState(null);

  // Hypothetical hook or function to initialize the editor with a schema
  const editor = useEditor({
    schema: {
      nodes: {
        doc: { content: "block+" },
        paragraph: { content: "text*", toDOM: () => ["p", 0] },
        text: { inline: true },
      },
      marks: {
        // Define marks if needed
      },
    },
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContent
        initialContent={content}
        onUpdate={({ editor }) => {
          const json = editor.getJSON();
          setContent(json);
        }}
      />
    </EditorRoot>
  );
};

export default TestPage;