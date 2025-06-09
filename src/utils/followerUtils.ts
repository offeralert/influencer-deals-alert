
// Utility function to format follower counts consistently
export const formatFollowerCount = (count: number): string => {
  if (count === 0) return '0 followers';
  if (count === 1) return '1 follower';
  
  if (count < 1000) {
    return `${count} followers`;
  } else if (count < 1000000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k followers`;
  } else {
    const m = count / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M followers`;
  }
};

// Compact version for cards
export const formatFollowerCountCompact = (count: number): string => {
  if (count === 0) return '0';
  if (count === 1) return '1';
  
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  } else {
    const m = count / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
};
