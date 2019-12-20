import React, { Component } from "react";
import FileVisualizerControls from "./fileVisualizerControls";
import AsciiUtilities from "../util/asciiUtilities";

class FileVisualizer extends Component {
  state = { asciiText: "ascmii" };

  constructor(props) {
    super(props);

    this.supportedImageTypes = ["bmp", "jpg", "jpeg", "png", "gif"];
    this.supportedVideoTypes = ["mp4"];

    this.canvas = null;
    this.setCanvas = element => {
      this.canvas = element;
    };

    this.videoPlayer = null;
    this.setVideoPlayer = element => {
      this.videoPlayer = element;
    };
  }

  renderImageFile(file) {
    const { darkModeOn } = this.props;

    var img = new Image();
    img.onload = e => {
      console.log("loaded");
      const { width, height } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(img.width, img.height);
      console.log(width, height);
      this.canvas.width = width;
      this.canvas.height = height;
      let ctx = this.canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(imageData, 128, darkModeOn);

      this.setState({ asciiText: formattedAscii });
    };
    img.src = URL.createObjectURL(file);
  }

  renderVideoFile(file) {
    console.log("render video");

    this.videoPlayer.src = URL.createObjectURL(file);
    this.videoPlayer.play();
    this.frameTimer = setInterval(this.getNextFrame.bind(this), 1000 / 30);
  }

  getNextFrame() {
    const { darkModeOn } = this.props;

    const { width, height } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      this.canvas.width,
      this.canvas.height
    );

    this.canvas.getContext("2d").drawImage(this.videoPlayer, 0, 0, width, height);

    const canvasContext = this.canvas.getContext("2d");
    const imageData = canvasContext.getImageData(0, 0, width, height);
    console.log(darkModeOn);
    const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(
      imageData,
      this.contrast,
      darkModeOn
    );

    this.setState({ asciiText: formattedAscii });
  }

  handleSelectFile(file) {
    const fileType = file.name
      .split(".")
      .pop()
      .toLowerCase();

    const isImageFile = this.supportedImageTypes.includes(fileType);
    const isVideoFile = this.supportedVideoTypes.includes(fileType);

    if (!isImageFile && !isVideoFile) {
      alert("This file type is not supported");
      return;
    }

    this.cleanUpPreviousResources();

    if (isImageFile) this.renderImageFile(file);
    if (isVideoFile) this.renderVideoFile(file);
  }

  cleanUpPreviousResources() {
    if (this.frameTimer) clearInterval(this.frameTimer);
  }

  render() {
    const { asciiText } = this.state;
    return (
      <div>
        <div className="center-wrapper">
          {/*  */}
          {/*Opacity set to 0 to support safari browsers. Hiding other ways won't work*/}
          <video style={{ opacity: 0 }} ref={this.setVideoPlayer} autoPlay playsInline />
        </div>

        {/*Canas: Hidden */}
        <div className="center-wrapper">
          {/* style={{ opacity: 0 }}  */}
          <canvas style={{ opacity: 0 }} ref={this.setCanvas} width="200" height="200" />
        </div>

        {/*ascii */}
        <div className="center-wrapper">
          <pre id="ascii">{asciiText}</pre>
        </div>

        <div className="bottom-right-wrapper">
          <FileVisualizerControls onSelectFile={this.handleSelectFile.bind(this)} />
        </div>
      </div>
    );
  }
}

export default FileVisualizer;
