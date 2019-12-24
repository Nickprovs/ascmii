import React from "react";

const Issue = ({ history }) => {
  const issue = history.location.state.issue ? history.location.state.issue : "Issue";
  return (
    <div className="center-wrapper">
      <h1>{issue}</h1>
    </div>
  );
};

export default Issue;
