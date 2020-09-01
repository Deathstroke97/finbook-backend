import React, { useEffect, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { isBusinessActive } from "utils/functions";

const Help = () => {
  const history = useHistory();
  const { user } = useContext(SessionContext);

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <h5 style={{ fontWeight: "bold" }}>Help page will be shown here</h5>
    </div>
  );
};

export default Help;
