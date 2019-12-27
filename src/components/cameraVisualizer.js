import React, { Component } from "react";
import WebRtcUtilities from "../util/webRtcUtilities";
import AsciiUtilities from "../util/asciiUtilities";
import CameraVisualizerControls from "./cameraVisualizerControls";
import { withRouter } from "react-router-dom";

class CameraVisualizer extends Component {
  state = {
    asciiText: "ascmii",
    running: false,
    playing: false
  };

  constructor(props) {
    super(props);
    this.currentStream = null;
    this.contrast = 128;
    this.currentVideoInputId = "";
    this.canvasFlipped = false;
    this.requestedWidth = 640;
    this.requestedHeight = 480;
    this.constraints = {
      audio: false,
      video: { width: this.requestedWidth, height: this.requestedHeight },
      aspectRatio: this.requestedWidth / this.requestedHeight,
      frameRate: { ideal: 30, max: 60 }
    };

    this.getNextFrame = this.getNextFrame.bind(this);

    this.canvas = null;
    this.setCanvas = element => {
      this.canvas = element;
    };

    this.videoPlayer = null;
    this.setVideoPlayer = element => {
      this.videoPlayer = element;
    };
  }

  async componentDidMount() {
    this.checkForSupportIssues();
    this.canvasContext = this.canvas.getContext("2d");
    await this.init();
  }

  componentWillUnmount() {
    this.stop();
  }

  async init() {
    await this.setNextVideoInputId();
  }

  async setNextVideoInputId() {
    try {
      const nextDeviceId = await WebRtcUtilities.getNextVideoInputIdAsync(this.currentVideoInputId);
      this.currentVideoInputId = nextDeviceId;
    } catch (ex) {
      console.log(this.context);
    }
  }

  async play() {
    if (!this.props.userAcceptedFlickerConfirmation) {
      let userAgreesToProceed = window.confirm(
        "Some cameras can produce a flickering / strobe effect which may be unsuitable for some users. Proceed?"
      );
      if (!userAgreesToProceed) return;
      else this.props.onUserAcceptedFlickerConfirmation();
    }

    try {
      if (this.state.playing) await this.stop();

      this.constraints.video.deviceId = { exact: this.currentVideoInputId };

      this.currentStream = await navigator.mediaDevices.getUserMedia(this.constraints);
      if (
        this.getCanvasRequiresFlip(this.canvasFlipped, this.currentStream.getVideoTracks()[0].getSettings().facingMode)
      )
        this.flipCanvas();

      this.videoPlayer.srcObject = this.currentStream;

      const frameRate = WebRtcUtilities.getFrameRateForMediaStream(this.currentStream);
      this.frameTimer = setInterval(this.getNextFrame, 1000 / frameRate);
      this.setState({ playing: true });
      this.setState({ running: true });
    } catch (ex) {
      this.props.history.push({ pathname: "/issue", state: { issue: "No camera available." } });
      return;
    }
  }

  stop() {
    if (!this.state.playing) return;
    if (this.frameTimer) clearInterval(this.frameTimer);
    WebRtcUtilities.stopStreamedVideo(this.videoPlayer);
    this.setState({ playing: false });
  }

  checkForSupportIssues() {
    if (!navigator.mediaDevices.getUserMedia)
      this.props.history.push({ pathname: "/issue", state: { issue: "This browser is not supported." } });
  }

  getCanvasRequiresFlip(canvasAlreadyFlipped, webRtcCameraFacingMode) {
    if (!canvasAlreadyFlipped && webRtcCameraFacingMode === "user") return true;

    if (canvasAlreadyFlipped && webRtcCameraFacingMode === "environment") return true;

    return false;
  }

  flipCanvas() {
    const canvasContext = this.canvas.getContext("2d");
    canvasContext.translate(this.canvas.width, 0);
    canvasContext.scale(-1, 1);
    this.canvasFlipped = !this.canvasFlipped;
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
    const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(
      imageData,
      this.contrast,
      darkModeOn
    );

    this.setState({ asciiText: formattedAscii });
  }

  async handleTogglePlay() {
    if (this.state.playing) this.stop();
    else await this.play();
  }

  async handleToggleCamera() {
    await this.stop();
    await this.setNextVideoInputId();
    await this.play();
  }

  render() {
    const { running, playing, asciiText } = this.state;

    const { width: adjustedWidth, height: adjustedHeight } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      this.requestedWidth,
      this.requestedHeight
    );

    return (
      <div>
        {/*Video: Hidden */}
        <div className="center-wrapper">
          {/*Opacity set to 0 to support safari browsers. Hiding other ways won't work*/}
          <video style={{ opacity: 0 }} ref={this.setVideoPlayer} autoPlay playsInline />
        </div>

        {/*Canas: Hidden */}
        {/*Opacity set to 0 to support safari browsers. Hiding other ways won't work*/}
        <div className="center-wrapper">
          <canvas style={{ opacity: 0 }} ref={this.setCanvas} width={adjustedWidth} height={adjustedHeight} />
        </div>

        {/*ascii */}
        <div className="center-wrapper">
          <pre id="ascii">{asciiText}</pre>
        </div>

        <div className="bottom-right-wrapper">
          <CameraVisualizerControls
            playing={playing}
            running={running}
            onToggleCamera={this.handleToggleCamera.bind(this)}
            onTogglePlay={this.handleTogglePlay.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(CameraVisualizer);
