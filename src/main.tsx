
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCacheManagement } from './utils/cacheUtils'

// Initialize cache management
initializeCacheManagement();

createRoot(document.getElementById("root")!).render(<App />);
