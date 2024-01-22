import { useRef, useCallback } from "react";

export const useTokenAdder = (setText: (reply: string) => void) => {
  const r = useRef("")
  const rr = useRef("")
  const pendingTokens = useRef<string[]>([]);
  const adding = useRef(false);
  const addTokens = useCallback((newTokens: string) => {
    pendingTokens.current.push(...Array.from(newTokens));
    rr.current += newTokens;
    if (!adding.current) {
      adding.current = true;
      setTimeout(async () => {
        while (pendingTokens.current.length) {
          r.current += pendingTokens.current.shift();
          setText(r.current);
          await new Promise(r => requestAnimationFrame(r));
        }
        adding.current = false;
      }, 0);
    }
  }, [setText]);
  return [addTokens, r, rr] as const;
};