import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import Theme from "./components/common/Theme";
import Theming from "./lib/theming";
import CameraVisualizer from "./components/cameraVisualizer";
import FileVisualizer from "./components/fileVisualizer";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import Issue from "./components/issue";
import "./App.css";

class App extends Component {
  state = {
    darkModeOn: false,
    navBarCollapsed: true,
    userAcceptedFlickerConfirmation: false
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

  handleFlickerConfirmation() {
    this.setState({ userAcceptedFlickerConfirmation: true });
  }

  render() {
    const theme = this.state.darkModeOn ? Theme.Dark : Theme.Light;
    const { darkModeOn, userAcceptedFlickerConfirmation } = this.state;
    return (
      <Theme variables={theme}>
        <BrowserRouter>
          <NavBar onThemeClick={this.handleToggleTheme.bind(this)} />
          <div className="content">
            <Switch>
              <Route
                path="/camera"
                render={props => (
                  <CameraVisualizer
                    onUserAcceptedFlickerConfirmation={this.handleFlickerConfirmation.bind(this)}
                    userAcceptedFlickerConfirmation={userAcceptedFlickerConfirmation}
                    darkModeOn={darkModeOn}
                  />
                )}
              />
              <Route path="/file" render={props => <FileVisualizer darkModeOn={this.state.darkModeOn} />} />
              <Route path="/issue" component={Issue} />
              <Route path="/not-found" component={NotFound} />
              <Redirect exact from="/" to="/camera" />
              <Redirect to="/not-found" />
            </Switch>
          </div>
        </BrowserRouter>
      </Theme>
    );
  }
}

export default App;
