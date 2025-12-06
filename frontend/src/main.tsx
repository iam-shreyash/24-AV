import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./components/auth/AuthContext";
import { ToastProvider } from "./components/ui/toaster";
import "./i18n";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Hide initial loader once React is ready
const hideInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    // Add fade-out class
    loader.classList.add("fade-out");

    // Remove from DOM after animation completes
    setTimeout(() => {
      loader.remove();
    }, 500); // Match the CSS transition duration
  }
};

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Hide loader after displaying the animation (2 seconds for better UX)
setTimeout(hideInitialLoader, 2000);

