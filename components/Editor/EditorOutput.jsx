import React from "react";
import EditorJsHtml from "editorjs-html";
import "./EditorOutput.css";

const editorJsParser = EditorJsHtml();

const EditorOutput = ({ data }) => {
  if (!data || !data.blocks) return <p>No content available</p>;

  // Convert Editor.js JSON data into HTML
  const htmlOutput = editorJsParser.parse(data);

  return (
    <div className="elio-react-components EditorOutput">
      {/* {htmlOutput.map((block, index) => (
      ))} */}
      <div dangerouslySetInnerHTML={{ __html:  htmlOutput }} />
      
    </div>
  );
};

export default EditorOutput;
