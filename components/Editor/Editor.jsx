import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import LinkTool from "@editorjs/link";
import Paragraph from "@editorjs/paragraph";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

const EditorComponent = ({ data, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        placeholder: "Start writing...",
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          image: ImageTool,
          table: Table,
          linkTool: LinkTool,
          marker: Marker,
          inlineCode: InlineCode,
        },
        data,
        onChange: async () => {
          const savedData = await editor.save();
          onChange && onChange(savedData);
        },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return <div id="editorjs" style={{ minHeight: "300px", border: "1px solid #ddd", padding: "10px" }}></div>;
};

export default EditorComponent;

