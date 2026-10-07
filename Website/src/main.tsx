import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import "./index.css";
import "./firebase";
import { startVisitTracking } from "./content/visits";
import { startThemeSync } from "./content/theme";
import { CookieBanner } from "./components/CookieBanner";

startThemeSync();
// Visit counters (tiny requests) start after the page has fully loaded and the browser is idle.
const startCounters = () =>
  'requestIdleCallback' in window ? window.requestIdleCallback(startVisitTracking, { timeout: 3000 }) : setTimeout(startVisitTracking, 1500);
if (document.readyState === 'complete') startCounters();
else window.addEventListener('load', startCounters, { once: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <CookieBanner />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
