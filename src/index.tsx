import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { Game } from "./components/Game";

function App() {
  return <Game />;
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
