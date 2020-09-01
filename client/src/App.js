import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { SessionContext } from "./context/SessionContext";
import routes from "./routes";
import "./App.css";
import moment from "moment";
import { DashboardLayout } from "./layouts";
import Settings from "./views/dashboard/Settings";

import Landing from "./views/landing/landing";
import LandingLayout from "./layouts/landing";

const App = () => {
  const { user } = useContext(SessionContext);

  let router = (
    <LandingLayout>
      <Landing />
    </LandingLayout>
  );

  if (user.isAuthenticated) {
    router = (
      <Router>
        <div>
          {routes.map((route, index) => {
            return (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                component={() => {
                  return (
                    <route.layout>
                      <route.component></route.component>
                    </route.layout>
                  );
                }}
              />
            );
          })}
          <Redirect to="/dashboard" />
        </div>
      </Router>
    );
  }
  return <div>{router}</div>;
};

export default App;
