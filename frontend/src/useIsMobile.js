// frontend/src/useIsMobile.js
import { useEffect, useState } from 'react';

// Helper to detect mobile via User-Agent as fallback
function isMobileUserAgent() {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

export default function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;
  
  // Initial state with multiple checks for better production reliability
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // First check media query
    const mediaMatch = window.matchMedia(query).matches;
    
    // If viewport seems desktop but user agent is mobile, trust user agent
    // This handles cases where viewport might not be set correctly initially
    if (!mediaMatch && isMobileUserAgent()) {
      return true;
    }
    
    return mediaMatch;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    
    // Force immediate check on mount
    const currentMatch = mql.matches;
    const isMobileUA = isMobileUserAgent();
    
    // Update if needed based on both checks
    if (currentMatch || isMobileUA) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
    
    // Continue listening for viewport changes
    const onChange = (e) => setIsMobile(e.matches || isMobileUserAgent());
    mql.addEventListener('change', onChange);
    
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}