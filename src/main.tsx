
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeVersionCheck } from './utils/cacheUtils'

// Initialize version checking for cache management
initializeVersionCheck();

createRoot(document.getElementById("root")!).render(<App />);
