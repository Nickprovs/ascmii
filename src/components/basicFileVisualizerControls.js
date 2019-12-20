import React, { Component } from "react";
import StandardButton from "./common/standardButton";
import "../styles/visualizerControls.css";
import FileInputButton from "./common/fileInputButton";

const FileVisualizerControls = ({ onSelectFile }) => {
  return (
    <div className="visualizerControls">
      <FileInputButton onSelectFile={onSelectFile}>File</FileInputButton>
      {/* <div style={{ marginTop: "10px" }}></div> */}
    </div>
  );
};

export default FileVisualizerControls;
