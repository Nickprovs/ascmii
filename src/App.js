import React, { Component } from "react";
import Theme from "./components/common/theme";
import Theming from "./lib/theming";
import CameraVisualizer from "./components/cameraVisualizer";
import "./App.css";

class App extends Component {
  state = {
    darkModeOn: false
  };

  constructor(props) {
    super(props);
    this.theming = new Theming();
  }

  componentDidMount() {
    this.setState({
      darkModeOn: this.theming.getSavedDarkModeOnStatus()
    });
  }

  handleToggleTheme() {
    const darkModeOn = !this.state.darkModeOn;
    this.setState({ darkModeOn });
    this.theming.saveDarkModeOnStatus(darkModeOn);
  }

  render() {
    const theme = this.state.darkModeOn ? Theme.Dark : Theme.Light;
    return (
      <Theme variables={theme}>
        <div style={{ zIndex: "2" }} className="top-left-wrapper">
          <button onClick={this.handleToggleTheme.bind(this)}>Theme</button>
        </div>

        <CameraVisualizer style={{ zIndex: "1" }} />
      </Theme>
    );
  }
}

export default App;
