import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Player from "./components/Player.jsx";

const path = window.location.pathname;
const Root = path === "/player" ? <Player /> : <App />;

ReactDOM.createRoot(document.getElementById("root")).render(Root);
