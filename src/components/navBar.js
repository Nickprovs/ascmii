import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/navBar.css";

const NavBar = props => {
  return (
    <div className="nav">
      <input type="checkbox" id="nav-check" />
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

      <div className="nav-links">
        <NavLink className="nav-item nav-link" to="/camera">
          From Camera
        </NavLink>
        <NavLink className="nav-item nav-link" to="/file">
          From File
        </NavLink>
      </div>
    </div>
  );
};

export default NavBar;
