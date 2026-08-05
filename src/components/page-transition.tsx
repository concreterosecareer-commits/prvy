"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DURATION = 150; // ms for each half of the transition

type Phase = "idle" | "out" | "in";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const router = useRouter();
  const transitioning = useRef(false);

  // When a new page has loaded: overlay is black → fade to transparent
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    // Overlay is currently at opacity 1 (from the "out" phase).
    // Setting phase="in" targets opacity 0 with transition → fades from black.
    setPhase("in");
    const t = setTimeout(() => {
      setPhase("idle");
      transitioning.current = false;
    }, DURATION);
    return () => clearTimeout(t);
  }, [pathname]);

  // Intercept internal link clicks
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (transitioning.current) return;

      const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!a) return;

      const href = a.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href === pathname ||
        href.startsWith("//") ||
        a.target === "_blank" ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      ) return;

      e.preventDefault();
      e.stopPropagation();
      transitioning.current = true;

      // Overlay fades from transparent → black
      setPhase("out");
      setTimeout(() => router.push(href), DURATION);
    };

    // Capture phase so we intercept before Next.js's Link handler
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  /*
   * opacity logic:
   *   "idle" → 0, no transition  (invisible, not blocking)
   *   "out"  → 1, with transition (0 → 1: page fades to black)
   *   "in"   → 0, with transition (1 → 0: page fades from black)
   */
  const opacity = phase === "out" ? 1 : 0;
  const transition = phase !== "idle" ? `opacity ${DURATION}ms ease` : "none";

  return (
    <>
      {children}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 9999,
          pointerEvents: "none",
          opacity,
          transition,
        }}
      />
    </>
  );
}
