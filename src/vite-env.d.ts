
/// <reference types="vite/client" />

// Rewardful global type definition
interface Window {
  _rwq?: any[];
  rewardful?: (action: string, data?: any) => void;
}
