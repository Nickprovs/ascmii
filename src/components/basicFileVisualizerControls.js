import React, { Component } from "react";
import StandardButton from "./common/standardButton";
import "../styles/visualizerControls.css";
import FileInputButton from "./common/fileInputButton";

const BasicFileVisualizerControls = ({ onSelectFile }) => {
  return (
    <div className="visualizerControls">
      <FileInputButton onSelectFile={onSelectFile}>File</FileInputButton>
    </div>
  );
};

export default BasicFileVisualizerControls;
