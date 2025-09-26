import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/App.jsx";
import AuthProvider from "./auth/AuthProvider";   // ⟵ importa el provider
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
