import React from "react";
import "../../styles/standardButton.css";

const StandardButton = ({ content, onClick, ...rest }) => {
  return (
    <button onClick={onClick} className="standardButton" {...rest}>
      {content}
    </button>
  );
};

export default StandardButton;
