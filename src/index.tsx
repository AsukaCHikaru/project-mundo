import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

function App() {
  return (
    <h1 className="grid min-h-screen place-items-center text-4xl font-bold text-sky-600">
      Hello, world!
    </h1>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
