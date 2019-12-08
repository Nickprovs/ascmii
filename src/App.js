import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

//Flow
//Get camera stream from WebRtc
//Poop that into hidden video element
//Periodically draw a video frame to a hidden canvas
//Loop through that image's canvas data and build a formatted text string
//Assign that

class App extends Component {
  state = {
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
    };

    this.videoPlayer = null;
    this.setVideoPlayer = element => {
      this.videoPlayer = element;
    };
  }

  async handleBeginClick() {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      this.videoPlayer.srcObject = this.currentStream;
      this.setState({ running: true });
    } catch (ex) {
      console.log(ex);
    }
  }

  handleSnapshotClick() {
    const [width, height] = this.clampDimensions(
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

    console.log(rawAscii);
    this.setState({ asciiText: rawAscii });
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

      if ((i + 1) % width === 0) {
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
    const MAXIMUM_WIDTH = 80;
    const MAXIMUM_HEIGHT = 50;

    if (height > MAXIMUM_HEIGHT) {
      const reducedWidth = Math.floor((width * MAXIMUM_HEIGHT) / height);
      return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
      const reducedHeight = Math.floor((height * MAXIMUM_WIDTH) / width);
      return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [width, height];
  }

  render() {
    const { running, asciiText } = this.state;

    return (
      <div className="App">
        {/*Video: Hidden */}
        <div style={{ display: "none" }}>
          <video
            ref={this.setVideoPlayer}
            autoPlay
            playsInline
            width="720"
            height="480"
          />
        </div>

        {/*Canas: Hidden */}
        <div>
          <canvas ref={this.setCanvas} width="720" height="480" />
        </div>

        {/*ascii */}
        <pre id="ascii">{asciiText}</pre>

        <button onClick={this.handleBeginClick.bind(this)}>Begin</button>
        {running && (
          <button onClick={this.handleSnapshotClick.bind(this)}>
            Snapshot
          </button>
        )}
      </div>
    );
  }
}

export default App;
