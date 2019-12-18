import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import Theme from "./components/common/theme";
import Theming from "./lib/theming";
import CameraVisualizer from "./components/cameraVisualizer";
import FileVisualizer from "./components/fileVisualizer";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import "./App.css";
import StandardButton from "./components/common/standardButton";
import PlainButton from "./components/common/plainButton";

class App extends Component {
  state = {
    darkModeOn: false,
    navBarCollapsed: true
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

  handleNavBarToggle() {
    this.setState({ navBarCollapsed: !this.state.navBarCollapsed });
  }

  handleStandardOnClick() {
    console.log("hey");
  }

  render() {
    const theme = this.state.darkModeOn ? Theme.Dark : Theme.Light;
    const { navBarCollapsed } = this.state;
    return (
      <Theme variables={theme}>
        <BrowserRouter>
          <NavBar onThemeClick={this.handleToggleTheme.bind(this)} />
          <div className="content">
            <Switch>
              <Route path="/camera" component={CameraVisualizer} />
              <Route path="/file" component={FileVisualizer} />
              <Route path="/not-found" component={NotFound} />
              <Redirect exact from="/" to="/camera" />
              <Redirect to="/not-found" />
            </Switch>
          </div>
        </BrowserRouter>

        {/* <CameraVisualizer style={{ zIndex: "1" }} /> */}
      </Theme>
    );
  }
}

export default App;
