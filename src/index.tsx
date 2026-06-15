import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <h1>Hello, world!</h1>;
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
