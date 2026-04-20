/**
 * Shared breakpoint hook — Mobile < 640 | Tablet 640–1024 | Desktop > 1024
 * Usage:
 *   const bp = useBreakpoint();
 *   const cols = rv(bp, "1fr", "1fr 1fr", "repeat(4,1fr)");
 */
import { useState, useEffect } from "react";

function snap(w) {
  return { mobile: w < 640, tablet: w >= 640 && w < 1024, desktop: w >= 1024 };
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() => snap(window.innerWidth));
  useEffect(() => {
    const h = () => setBp(snap(window.innerWidth));
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return bp;
}

/**
 * rv(bp, mobileVal, tabletVal, desktopVal)
 * Returns the appropriate value for the current breakpoint.
 */
export function rv(bp, m, t, d) {
  if (bp.mobile)  return m;
  if (bp.tablet)  return t;
  return d;
}
