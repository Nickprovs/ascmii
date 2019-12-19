import React, { Component } from "react";
import FileVisualizerControls from "./fileVisualizerControls";
import AsciiUtilities from "../util/asciiUtilities";

class FileVisualizer extends Component {
  state = { asciiText: "ascmii" };

  constructor(props) {
    super(props);

    this.canvas = null;
    this.setCanvas = element => {
      this.canvas = element;
    };
  }

  handleSelectFile(file) {
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

  render() {
    const { asciiText } = this.state;
    return (
      <div>
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
