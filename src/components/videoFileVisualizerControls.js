import React, { Component } from "react";
import StandardButton from "./common/standardButton";
import "../styles/visualizerControls.css";
import FileInputButton from "./common/fileInputButton";

const VideoFileVisualizerControls = ({ onSelectFile, isVideoPlaying, onTogglePlay }) => {
  return (
    <div className="visualizerControls">
      <div style={{ marginBottom: "10px" }}>
        <StandardButton onClick={onTogglePlay}>{isVideoPlaying ? "Pause" : "Play"}</StandardButton>
      </div>
      <FileInputButton onSelectFile={onSelectFile}>File</FileInputButton>
    </div>
  );
};

export default VideoFileVisualizerControls;
