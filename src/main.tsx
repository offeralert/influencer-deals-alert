
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { captureReferral } from './lib/rewardful';

// Capture referral parameters from URL if present
captureReferral();

createRoot(document.getElementById("root")!).render(<App />);
