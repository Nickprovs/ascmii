import React, { Component } from "react";
import FileVisualizerControls from "./fileVisualizerControls";
class FileVisualizer extends Component {
  state = { asciiText: "ascmii" };

  constructor(props) {
    super(props);
  }

  handleSelectFile(selectedFile) {
    console.log(selectedFile);
  }

  render() {
    const { asciiText } = this.state;
    return (
      <div>
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
