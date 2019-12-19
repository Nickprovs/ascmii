import React, { Component } from "react";
import "../../styles/fileInputButton.css";

class FileInputButton extends Component {
  state = {};

  constructor(props) {
    super(props);

    this.fileInputButton = null;
    this.setFileInputButton = element => {
      this.fileInputButton = element;
    };
  }

  handleProxyClick() {
    this.fileInputButton.click();
  }

  handleSelectFileIntermediary() {
    const { onSelectFile } = this.props;
    if (this.fileInputButton.files.length > 0) onSelectFile(this.fileInputButton.files[0]);
  }

  render() {
    const { onSelectFile, children } = this.props;
    return (
      <div>
        <input
          onChange={this.handleSelectFileIntermediary.bind(this)}
          ref={this.setFileInputButton}
          type="file"
          style={{ display: "none" }}
        />
        <input className="standardButton" type="button" value={children} onClick={this.handleProxyClick.bind(this)} />
      </div>
    );
  }
}

export default FileInputButton;
