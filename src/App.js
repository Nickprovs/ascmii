import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

//Flow
//Get camera stream from WebRtc
//Poop that into hidden video element
//Periodically draw a video frame to a hidden canvas
//Loop through that image's canvas data and build a formatted image-like ascii string
//Bind that string to a pre tag on the markup

//TODO:
// 1.) Make sure the app doesn't make look people look fat in vertical mode
// 2.) First Pass Re-Factor
// 3.) Polish UI
// 4.) Second Pass Re-Factor

//Stretch Goals
// 1.) Select a local file to view in ASCII
// 2.) Select a video at a URL to view in ASCII
//    a.) Get an iFrame... hide it like the video tag. Bind that to the canvas.
// 3.) For 1.) and 2.) make sure to componentize the project
// 4.) The ASCII player should render the pre and take in as props the canvas

class App extends Component {
  state = {
    originalContentWidth: 720,
    originalContentHeight: 480,
    running: false,
    asciiText: "dogs"
  };

  constraints = {
    audio: false,
    video: true
  };

  constructor(props) {
    super(props);
    this.characters = " .,:;i1tfLCG08@".split("");
    this.currentStream = null;
    this.contrast = 128;

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

  componentWillUnmount() {
    if (this.frameTimer) clearInterval(this.frameTimer);
  }

  useEffect() {
    console.log("USE EFFECT");
  }

  async handleBeginClick() {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      this.videoPlayer.srcObject = this.currentStream;
      this.setState({ running: true });
      this.initCanvas();
      this.frameTimer = setInterval(this.getNextFrame.bind(this), 1000 / 30);
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

  initCanvas() {
    console.log("translating", this.canvas.width);

    const canvasContext = this.canvas.getContext("2d");
    canvasContext.translate(this.canvas.width, 0);
    canvasContext.scale(-1, 1);
  }

  getRawAsciiTextForGrayScaleAndWidth(grayScales, width) {
    let ascii = "";
    for (let i = 0; i < grayScales.length; i++) {
      let nextCharacter = this.getCharacterForGrayScale(grayScales[i]);
      if ((i + 1) % width === 0) nextCharacter += "\n";

      ascii = ascii + nextCharacter;
    }

    return ascii;
  }

  getAsciiCharactersFromCanvasContext(context, width, height) {
    console.log("Width and Height");
    console.log(width);
    console.log(height);
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
        console.log("breaking at", pixelNum);
        //Skip every other line
        console.log(i);
        let newI = i + this.canvas.width * 4;
        console.log(newI);
        i = newI;
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

  getCharacterForGrayScale(grayScale) {
    return this.grayRamp[
      Math.ceil(((this.grayRamp.length - 1) * grayScale) / 255)
    ];
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

  render() {
    const {
      originalContentWidth,
      originalContentHeight,
      running,
      asciiText
    } = this.state;

    console.log("or");
    console.log(originalContentWidth);
    console.log(originalContentHeight);

    const {
      width: adjustedWidth,
      height: adjustedHeight
    } = this.clampDimensions(originalContentWidth, originalContentHeight);

    console.log("Adjusted");
    console.log(adjustedWidth);
    console.log(adjustedHeight);

    return (
      <div className="App">
        {/*Video: Hidden */}
        <div style={{ display: "none" }}>
          <video
            ref={this.setVideoPlayer}
            autoPlay
            playsInline
            width={originalContentWidth}
            height={originalContentHeight}
          />
        </div>

        {/*Canas: Hidden */}
        <div>
          <canvas
            ref={this.setCanvas}
            width={adjustedWidth}
            height={adjustedHeight}
          />
        </div>

        {/*ascii */}
        <pre id="ascii">{asciiText}</pre>

        {!running && (
          <button onClick={this.handleBeginClick.bind(this)}>Begin</button>
        )}
      </div>
    );
  }
}

export default App;
