import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Player from "./components/Player.jsx";

// Safe path detection for SSR environments
const path = typeof window !== 'undefined' ? window.location.pathname : '/';
const Root = path === "/player" ? <Player /> : <App />;

// Ensure DOM is available before rendering
if (typeof document !== 'undefined') {
  ReactDOM.createRoot(document.getElementById("root")).render(Root);
}
