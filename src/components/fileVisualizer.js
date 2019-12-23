import React, { Component } from "react";
import BasicFileVisualizerControls from "./basicFileVisualizerControls";
import VideoFileVisualizaerControls from "./videoFileVisualizerControls";
import AsciiUtilities from "../util/asciiUtilities";

class FileVisualizer extends Component {
  state = { asciiText: "ascmii", videoMode: false, isVideoPlaying: false };

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

  componentWillUnmount() {
    console.log("willunmount");
    this.cleanUpPreviousResources();
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

    if (isImageFile) {
      this.setState({ videoMode: false });
      this.renderImageFile(file);
    }
    if (isVideoFile) {
      this.setState({ videoMode: true });
      this.renderVideoFile(file);
    }
  }

  renderImageFile(file) {
    const { darkModeOn } = this.props;

    var img = new Image();
    img.onload = e => {
      const { width, height } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(img.width, img.height);
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
    this.setVideoFileUrl(file);
    this.setVideoDimensions();
    this.playVideo();
  }

  cleanUpPreviousResources() {
    this.cleanUpVideoResources();
  }

  cleanUpVideoResources() {
    if (this.videoFileUrl) URL.revokeObjectURL(this.videoFileUrl);
    this.stopVideo();
  }

  setVideoFileUrl(file) {
    this.videoFileUrl = URL.createObjectURL(file);
    this.videoPlayer.src = this.videoFileUrl;
  }

  setVideoDimensions() {
    const { width: fittedWidth, height: fittedHeight } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      this.videoPlayer.width,
      this.videoPlayer.height
    );

    this.videoPlayer.width = fittedWidth;
    this.videoPlayer.height = fittedHeight;
  }

  handleTogglePlay() {
    const { isVideoPlaying } = this.state;

    if (isVideoPlaying) this.stopVideo();
    else this.playVideo();

    console.log("state", isVideoPlaying);
  }

  playVideo() {
    this.videoPlayer.play();
    this.frameTimer = setInterval(this.getNextVideoFrame.bind(this), 1000 / 30);
  }

  stopVideo() {
    console.log("stopping video");
    this.videoPlayer.pause();
    if (this.frameTimer) clearInterval(this.frameTimer);
  }

  getNextVideoFrame() {
    const { darkModeOn } = this.props;
    const { width, height } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      this.canvas.width,
      this.canvas.height
    );

    this.canvas.getContext("2d").drawImage(this.videoPlayer, 0, 0, width, height);

    const canvasContext = this.canvas.getContext("2d");
    const imageData = canvasContext.getImageData(0, 0, width, height);
    const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(
      imageData,
      this.contrast,
      darkModeOn
    );

    this.setState({ asciiText: formattedAscii });
  }

  onVideoPlayed() {
    console.log("played event");

    this.setState({ isVideoPlaying: true });
  }

  onVideoStopped() {
    this.setState({ isVideoPlaying: false });
  }

  render() {
    const { asciiText, videoMode, isVideoPlaying } = this.state;

    return (
      <div>
        {/* Video: Hidden */}
        <div className="center-wrapper">
          {/* Initial width/height overwridden when file selected  */}
          <video
            onPlay={this.onVideoPlayed.bind(this)}
            onEnded={this.onVideoStopped.bind(this)}
            onPause={this.onVideoStopped.bind(this)}
            style={{ opacity: 0 }}
            width="320"
            height="180"
            ref={this.setVideoPlayer}
            autoPlay
            playsInline
          />
        </div>

        {/*Canas: Hidden */}
        <div className="center-wrapper">
          <canvas style={{ opacity: 0 }} ref={this.setCanvas} width="200" height="200" />
        </div>

        {/*ascii */}
        <div className="center-wrapper">
          <pre id="ascii">{asciiText}</pre>
        </div>

        <div className="bottom-right-wrapper">
          {!videoMode && <BasicFileVisualizerControls onSelectFile={this.handleSelectFile.bind(this)} />}
          {videoMode && (
            <VideoFileVisualizaerControls
              onSelectFile={this.handleSelectFile.bind(this)}
              onTogglePlay={this.handleTogglePlay.bind(this)}
              isVideoPlaying={isVideoPlaying}
            />
          )}
        </div>
      </div>
    );
  }
}

export default FileVisualizer;
