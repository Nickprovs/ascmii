import React from "react";
import "../../styles/plainButton.css";

const PlainButton = ({ children, className, onClick, ...rest }) => {
  return (
    <button {...rest} className={"plainButton " + className} onClick={onClick}>
      {children}
    </button>
  );
};

export default PlainButton;
