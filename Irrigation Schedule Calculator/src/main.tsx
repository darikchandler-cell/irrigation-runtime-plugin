import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AdminAnalytics from "./components/AdminAnalytics";
import "./index.css";

// Function to mount React app
function mountApp() {
  // Check for WordPress admin root element
  const adminRoot = document.getElementById("irrigation-calculator-admin-root");
  if (adminRoot) {
    // We're in WordPress admin - render AdminAnalytics
    console.log("Irrigation Calculator: Mounting AdminAnalytics component");
    createRoot(adminRoot).render(<AdminAnalytics />);
    return;
  }
  
  // Check for frontend root
  const frontendRoot = document.getElementById("irrigation-calculator-root");
  if (frontendRoot) {
    // We're on the frontend - render the main App
    console.log("Irrigation Calculator: Mounting App component");
    createRoot(frontendRoot).render(<App />);
    return;
  }
  
  // Fallback for development (Vite dev server uses #root)
  const devRoot = document.getElementById("root");
  if (devRoot) {
    console.log("Irrigation Calculator: Mounting App component (dev mode)");
    createRoot(devRoot).render(<App />);
    return;
  }
  
  // If no root found, wait and retry (for dynamic loading scenarios)
  console.warn("Irrigation Calculator: Root element not found, retrying...");
  setTimeout(() => {
    const retryRoot = document.getElementById("irrigation-calculator-root") || 
                     document.getElementById("irrigation-calculator-admin-root") ||
                     document.getElementById("root");
    if (retryRoot) {
      const rootId = retryRoot.id;
      console.log(`Irrigation Calculator: Found root element (${rootId}), mounting now`);
      if (rootId === "irrigation-calculator-admin-root") {
        createRoot(retryRoot).render(<AdminAnalytics />);
      } else {
        createRoot(retryRoot).render(<App />);
      }
    } else {
      console.error("Irrigation Calculator: No root element found after retry");
    }
  }, 100);
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  // DOM is already ready, but wait a bit for dynamic scripts
  setTimeout(mountApp, 50);
}