import React, { Component } from "react";
import StandardButton from "../components/common/standardButton";
import "../styles/visualizerControls.css";

const CameraVisualizerControls = ({ playing, running, onTogglePlay, onToggleCamera }) => {
  return (
    <div className="visualizerControls">
      <div>
        <StandardButton onClick={onTogglePlay}>{playing ? "Pause" : "Play"}</StandardButton>
      </div>
      <div style={{ marginTop: "10px" }}>
        <StandardButton
          title={running ? "Toggle Camera" : "Must be running to switch camera."}
          disabled={!running}
          onClick={onToggleCamera}
        >
          Camera
        </StandardButton>
      </div>
    </div>
  );
};

export default CameraVisualizerControls;
