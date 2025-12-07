// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/error-boundary";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
       <App />
    </ErrorBoundary>
     
    </BrowserRouter>
  </React.StrictMode>
);
