import React, { Component } from "react";
import StandardButton from "./common/standardButton";
import "../styles/visualizerControls.css";
import FileInputButton from "./common/fileInputButton";

const VideoFileVisualizerControls = ({ onSelectFile }) => {
  return (
    <div className="visualizerControls">
      <FileInputButton onSelectFile={onSelectFile}>File</FileInputButton>
      <div style={{ marginTop: "10px" }}>
        <StandardButton>test</StandardButton>
      </div>
    </div>
  );
};

export default VideoFileVisualizerControls;
