import React, { Component } from "react";
import WebRtcUtilities from "../util/webRtcUtilities";
import AsciiUtilities from "../util/asciiUtilities";
import StandardButton from "../components/common/standardButton";

class CameraVisualizer extends Component {
  state = {
    asciiText: "ascmii",
    running: false,
    playing: false
  };

  constructor(props) {
    super(props);
    this.characters = " .,:;i1tfLCG08@".split("");
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
      console.log(ex);
    }
  }

  async play() {
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
      this.frameTimer = setInterval(this.getNextFrame.bind(this), 1000 / frameRate);
      this.setState({ playing: true });
      this.setState({ running: true });
    } catch (ex) {
      console.log(ex);
    }
  }

  stop() {
    if (!this.state.playing) return;
    if (this.frameTimer) clearInterval(this.frameTimer);
    WebRtcUtilities.stopStreamedVideo(this.videoPlayer);
    this.setState({ playing: false });
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
    const { width, height } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      this.canvas.width,
      this.canvas.height
    );

    this.canvas.getContext("2d").drawImage(this.videoPlayer, 0, 0, width, height);

    const canvasContext = this.canvas.getContext("2d");
    const imageData = canvasContext.getImageData(0, 0, width, height);
    const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(imageData, this.contrast);

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
      <div className="rootDiv">
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

        <div
          style={{
            padding: "4px",
            borderStyle: "solid",
            borderColor: "var(--f1)",
            borderWidth: "0.75px",
            borderRadius: "4px"
          }}
          className="bottom-right-wrapper"
        >
          <div>
            <StandardButton onClick={this.handleTogglePlay.bind(this)}>{playing ? "Pause" : "Play"}</StandardButton>
          </div>
          <div style={{ marginTop: "10px" }}>
            <StandardButton
              title={running ? "Toggle Camera" : "Must be running to switch camera."}
              disabled={!running}
              onClick={this.handleToggleCamera.bind(this)}
            >
              Camera
            </StandardButton>
          </div>
        </div>
      </div>
    );
  }
}

export default CameraVisualizer;
