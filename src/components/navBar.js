import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import PlainButton from "./common/plainButton";
import "../styles/navBar.css";

class NavBar extends Component {
  state = {
    isOpen: false
  };

  constructor(props) {
    super(props);
  }

  handleNavBarClick() {
    this.setState({ isOpen: !this.state.isOpen });
    console.log(this.state.isOpen);
  }

  render() {
    const { onThemeClick } = this.props;
    return (
      <div className="nav">
        <input type="checkbox" id="nav-check" onClick={this.handleNavBarClick.bind(this)} checked={this.state.isOpen} />
        <div className="nav-header">
          <div className="nav-title">ascmii</div>
        </div>
        <div className="nav-btn">
          <label htmlFor="nav-check">
            <span></span>
            <span></span>
            <span></span>
          </label>
        </div>

        <div className="nav-links" onClick={this.handleNavBarClick.bind(this)}>
          <NavLink className="nav-item nav-link" to="/camera">
            From Camera
          </NavLink>
          <NavLink className="nav-item nav-link" to="/file">
            From File
          </NavLink>
          <div style={{}} className="nav-item">
            <PlainButton onClick={onThemeClick} className="plainButton-navBar">
              Theme
            </PlainButton>
          </div>
        </div>
      </div>
    );
  }
}

export default NavBar;
