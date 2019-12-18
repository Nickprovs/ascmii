import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
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
  }

  handleTitleBarClick() {
    if (this.state.isOpen) this.setState({ isOpen: false });
  }

  render() {
    const { onThemeClick } = this.props;
    return (
      <div className="nav">
        <input type="checkbox" id="nav-check" onClick={this.handleNavBarClick.bind(this)} checked={this.state.isOpen} />
        <div className="nav-header">
          <Link
            onClick={this.handleTitleBarClick.bind(this)}
            to="/"
            style={{ textDecoration: "none" }}
            className="nav-title"
          >
            ascmii
          </Link>
        </div>
        <div className="nav-btn">
          <label htmlFor="nav-check">
            <span></span>
            <span></span>
            <span></span>
          </label>
        </div>

        <div className="nav-links" onClick={this.handleNavBarClick.bind(this)}>
          <NavLink activeStyle={{ fontWeight: "bold" }} className="nav-item nav-link" to="/camera">
            From Camera
          </NavLink>
          <NavLink activeStyle={{ fontWeight: "bold" }} className="nav-item nav-link" to="/file">
            From File
          </NavLink>
          <a style={{ cursor: "pointer" }} onClick={onThemeClick}>
            Theme
          </a>
        </div>
      </div>
    );
  }
}

export default NavBar;
