import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[boot] main.tsx cargado");

const root = document.getElementById("root");
if (!root) {
  document.body.innerHTML += "<pre>No se encontró #root en index.html</pre>";
  throw new Error("No se encontró #root en index.html");
}

ReactDOM.createRoot(root).render(
  // Quita StrictMode mientras depuras para ver efectos 1:1
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

window.addEventListener("error", (e) => {
  console.error("[window.onerror]", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", e.reason);
});
