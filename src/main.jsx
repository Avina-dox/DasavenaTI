import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

window.onerror = (m, s, l, c, e) => { console.error("GlobalError:", m, s, l, c, e); };
window.onunhandledrejection = (ev) => { console.error("PromiseRejection:", ev?.reason || ev); };

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
