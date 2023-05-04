import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Network } from "./types";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const params = new URLSearchParams(window.location.search);
const network = params.get("network");
if (network?.toUpperCase() === Network.MAINNET || network?.toUpperCase() === Network.TESTNET ) {
  localStorage.setItem('network-select', JSON.stringify(network.toUpperCase()))
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
