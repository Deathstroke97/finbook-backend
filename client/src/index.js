import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import App from "./App";
import ThemeProvider from "./themeProvider";
import * as serviceWorker from "./serviceWorker";
import configureAppStore from "./configureAppStore";
import SessionProvider from "./context/SessionContext";
import moment from "moment";
moment.locale("ru-Ru");

const store = configureAppStore();

ReactDOM.render(
  <ThemeProvider>
    <Provider store={store}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);

serviceWorker.register();
