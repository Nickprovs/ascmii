import React, { Component } from "react";
import Theme from "./components/common/Theme";
import WebRtcUtilities from "./util/webRtcUtilities";
import AsciiUtilities from "./util/asciiUtilities";
import Theming from "./lib/theming";
import "./App.css";

//Stretch Goals
// 1.) Select a local file to view in ASCII
// 2.) Select a video at a URL to view in ASCII
//    a.) Get an iFrame... hide it like the video tag. Bind that to the canvas.
// 3.) For 1.) and 2.) make sure to componentize the project
// 4.) The ASCII player should render the pre and take in as props the canvas

class App extends Component {
  state = {
    asciiText: "dogs",
    originalContentWidth: 640,
    originalContentHeight: 480,
    running: false,
    playing: false,
    darkModeOn: false
  };

  constructor(props) {
    super(props);

    this.theming = new Theming();

    this.characters = " .,:;i1tfLCG08@".split("");
    this.currentStream = null;
    this.contrast = 128;
    this.currentVideoInputId = "";
    this.canvasFlipped = false;
    this.constraints = {
      audio: false,
      video: { width: 640, height: 480 },
      aspectRatio: 640 / 480,
      frameRate: { ideal: 30, max: 60 }
    };

    this.canvas = null;
    this.setCanvas = element => {
      this.canvas = element;
      this.canvasContext = this.canvas.getContext("2d");
    };

    this.videoPlayer = null;
    this.setVideoPlayer = element => {
      this.videoPlayer = element;
    };
  }

  async componentDidMount() {
    this.setState({
      darkModeOn: this.theming.getSavedDarkModeOnStatus()
    });

    await this.init();
  }

  async init() {
    await this.setNextVideoInputId();
  }

  componentWillUnmount() {
    this.stop();
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

  async handleToggleCamera() {
    await this.stop();
    await this.setNextVideoInputId();
    await this.play();
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
    const formattedAscii = AsciiUtilities.getFormattedAsciiCharactersFromCanvasImageData(imageData);

    this.setState({ asciiText: formattedAscii });
  }

  handleTogglePlay() {
    if (this.state.playing) this.stop();
    else this.play();
  }

  getCanvasRequiresFlip(canvasAlreadyFlipped, webRtcCameraFacingMode) {
    if (!canvasAlreadyFlipped && webRtcCameraFacingMode === "user") return true;

    if (canvasAlreadyFlipped && webRtcCameraFacingMode === "environment") return true;

    return false;
  }

  handleToggleTheme() {
    const darkModeOn = !this.state.darkModeOn;
    this.setState({ darkModeOn });
    this.theming.saveDarkModeOnStatus(darkModeOn);
  }

  render() {
    const { originalContentWidth, originalContentHeight, running, asciiText } = this.state;

    const { width: adjustedWidth, height: adjustedHeight } = AsciiUtilities.getRealisticDimensionForFittedAsciiText(
      originalContentWidth,
      originalContentHeight
    );

    let theme = this.state.darkModeOn ? Theme.Dark : Theme.Light;
    return (
      <Theme variables={theme}>
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

          {/* <h1 className="title">ascmii</h1> */}

          {/*ascii */}
          <div className="center-wrapper">
            <pre id="ascii">{asciiText}</pre>
          </div>

          <div className="top-right-wrapper">
            <button
              title={running ? "Toggle Camera" : "Must be running to switch camera."}
              disabled={!running}
              onClick={this.handleToggleCamera.bind(this)}
            >
              Camera
            </button>
          </div>

          <div className="top-left-wrapper">
            <button onClick={this.handleToggleTheme.bind(this)}>Theme</button>
          </div>

          <div className="bottom-left-wrapper">
            <button className="button" onClick={this.handleTogglePlay.bind(this)}>
              {this.state.playing ? "Pause" : "Play"}
            </button>
          </div>

          <div className="bottom-right-wrapper">
            <div className="standard-text-container">
              <label className="standard-text">ascmii</label>
            </div>
            <div className="standard-text-container">
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="http://www.nickprovs.com"
                className="standard-text standard-text-link"
              >
                Nickprovs
              </a>
            </div>
          </div>
        </div>
      </Theme>
    );
  }
}

export default App;
