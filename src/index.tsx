import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { Machine } from "./components/Machine";

function App() {
  return <Machine />;
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
