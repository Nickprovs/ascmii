import React, { Component } from "react";
import Theme from "./components/common/Theme";
import WebRtcUtilities from "./util/webRtcUtilities";
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
    originalContentWidth: 720,
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
      aspectRatio: 720 / 480
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

  componentDidMount() {
    this.setState({
      darkModeOn: this.theming.getSavedDarkModeOnStatus()
    });
  }

  componentWillUnmount() {
    this.stop();
  }

  play() {
    this.frameTimer = setInterval(this.getNextFrame.bind(this), 1000 / 30);
    this.setState({ playing: true });
  }

  stop() {
    if (this.frameTimer) clearInterval(this.frameTimer);
    this.setState({ playing: false });
  }

  async handleBeginClick() {
    try {
      await this.handleToggleCamera();

      this.setState({ running: true });

      this.play();
    } catch (ex) {
      console.log(ex);
    }
  }

  getNextFrame() {
    const { width, height } = this.clampDimensions(
      this.canvas.width,
      this.canvas.height
    );

    this.canvas
      .getContext("2d")
      .drawImage(this.videoPlayer, 0, 0, width, height);

    const canvasContext = this.canvas.getContext("2d");
    const rawAscii = this.getAsciiCharactersFromCanvasContext(
      canvasContext,
      width,
      height
    );
    this.setState({ asciiText: rawAscii });
  }

  flipCanvas() {
    const canvasContext = this.canvas.getContext("2d");
    canvasContext.translate(this.canvas.width, 0);
    canvasContext.scale(-1, 1);
    this.canvasFlipped = !this.canvasFlipped;
  }

  getAsciiCharactersFromCanvasContext(context, width, height) {
    const imageData = context.getImageData(0, 0, width, height);

    // calculate contrast factor
    // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
    var contrastFactor =
      (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));

    let ascii = "";

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];

      var contrastedColor = {
        red: this.bound(Math.floor((r - 128) * contrastFactor) + 128, [0, 255]),
        green: this.bound(Math.floor((g - 128) * contrastFactor) + 128, [
          0,
          255
        ]),
        blue: this.bound(Math.floor((b - 128) * contrastFactor) + 128, [
          0,
          255
        ]),
        alpha: a.alpha
      };

      var brightness =
        (0.299 * contrastedColor.red +
          0.587 * contrastedColor.green +
          0.114 * contrastedColor.blue) /
        255;

      var nextCharacter = this.characters[
        this.characters.length -
          1 -
          Math.round(brightness * (this.characters.length - 1))
      ];

      const pixelNum = Math.ceil((i + 1) / 4);
      if (i !== 0 && pixelNum % width === 0) {
        //Skip every other line
        if (
          window.matchMedia("(orientation: landscape)").matches &&
          pixelNum % (3 * width) === 0
        ) {
          let newI = i + this.canvas.width * 4;
          i = newI;
        }

        nextCharacter += "\n";
      }

      ascii = ascii + nextCharacter;
    }

    return ascii;
  }

  bound(value, interval) {
    return Math.max(interval[0], Math.min(interval[1], value));
  }

  getGrayscaleValueFromRBG(r, g, b) {
    return 0.21 * r + 0.72 * g + 0.07 * b;
  }

  clampDimensions(width, height) {
    const MAXIMUM_WIDTH = 187.5;
    const MAXIMUM_HEIGHT = 125;

    if (height > MAXIMUM_HEIGHT) {
      const reducedWidth = Math.floor((width * MAXIMUM_HEIGHT) / height);
      return { width: reducedWidth, height: MAXIMUM_HEIGHT };
    }

    if (width > MAXIMUM_WIDTH) {
      const reducedHeight = Math.floor((height * MAXIMUM_WIDTH) / width);
      return { width: MAXIMUM_WIDTH, height: reducedHeight };
    }

    return { width: width, height: height };
  }

  handleTogglePlay() {
    if (this.state.playing) this.stop();
    else this.play();
  }

  async handleToggleCamera() {
    try {
      const nextDeviceId = await WebRtcUtilities.getNextVideoInputIdAsync(
        this.currentVideoInputId
      );
      this.currentVideoInputId = nextDeviceId;
      this.constraints.video.deviceId = { exact: nextDeviceId };
      this.currentStream = await navigator.mediaDevices.getUserMedia(
        this.constraints
      );

      if (this.getCanvasRequiresFlip()) this.flipCanvas();

      this.videoPlayer.srcObject = this.currentStream;
    } catch (ex) {
      console.log(ex);
    }
  }

  getCanvasRequiresFlip() {
    if (
      !this.canvasFlipped &&
      this.currentStream.getVideoTracks()[0].getSettings().facingMode === "user"
    )
      return true;

    if (
      this.canvasFlipped &&
      this.currentStream.getVideoTracks()[0].getSettings().facingMode ===
        "environment"
    )
      return true;

    return false;
  }

  handleToggleTheme() {
    const darkModeOn = !this.state.darkModeOn;
    this.setState({ darkModeOn });
    this.theming.saveDarkModeOnStatus(darkModeOn);
  }

  render() {
    const {
      originalContentWidth,
      originalContentHeight,
      running,
      asciiText
    } = this.state;

    const {
      width: adjustedWidth,
      height: adjustedHeight
    } = this.clampDimensions(originalContentWidth, originalContentHeight);

    let theme = this.state.darkModeOn ? Theme.Dark : Theme.Light;
    return (
      <Theme variables={theme}>
        <div className="rootDiv">
          {/*Video: Hidden */}
          <div className="center-wrapper">
            {/*Opacity set to 0 to support safari browsers. Hiding other ways won't work*/}
            <video
              style={{ opacity: 0 }}
              ref={this.setVideoPlayer}
              autoPlay
              playsInline
              width={originalContentWidth}
              height={originalContentHeight}
            />
          </div>

          {/*Canas: Hidden */}
          {/*Opacity set to 0 to support safari browsers. Hiding other ways won't work*/}
          <div className="center-wrapper">
            <canvas
              style={{ opacity: 0 }}
              ref={this.setCanvas}
              width={adjustedWidth}
              height={adjustedHeight}
            />
          </div>

          {/* <h1 className="title">ascmii</h1> */}

          {/*ascii */}
          <div className="center-wrapper">
            <pre id="ascii">{asciiText}</pre>
          </div>

          <div className="top-right-wrapper">
            <button
              title={
                running ? "Toggle Camera" : "Must be running to switch camera."
              }
              disabled={!running}
              onClick={this.handleToggleCamera.bind(this)}
            >
              Camera
            </button>
          </div>

          <div className="top-left-wrapper">
            <button onClick={this.handleToggleTheme.bind(this)}>Theme</button>
          </div>

          {!running && (
            <div className="bottom-left-wrapper">
              <button onClick={this.handleBeginClick.bind(this)}>Begin</button>
            </div>
          )}

          {running && (
            <div className="bottom-left-wrapper">
              <button
                className="button"
                onClick={this.handleTogglePlay.bind(this)}
              >
                {this.state.playing ? "Pause" : "Play"}
              </button>
            </div>
          )}

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
