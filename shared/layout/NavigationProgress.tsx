"use client";

/**
 * Global "I clicked, something is happening" indicator.
 *
 * Problem this fixes: in App Router, clicking a `<Link>` to a server-rendered
 * route triggers an RSC fetch that can take 300-800 ms on cold cache. During
 * that window the URL bar doesn't change, no spinner is shown, the previous
 * page is still on screen, and impatient users click two or three more times
 * thinking the first click didn't register.
 *
 * We watch the pathname + searchParams via the App Router hooks. As soon as
 * EITHER changes we drive a thin progress bar across the top of the viewport,
 * synced to the same window during which Next is fetching the next route.
 *
 * Why not `nprogress` from npm:
 *   - The popular package depends on jQuery and ships its own CSS.
 *   - We just need 30 lines of CSS-animated div.
 *
 * Visual contract: 2 px thin bar pinned at the very top, brand color, fades
 * out when complete. Pointer-events: none so it never steals clicks.
 */
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search?.toString() ?? ""}`;

  const [progress, setProgress] = useState(0); // 0-100
  const [visible, setVisible] = useState(false);

  // First render is the initial page load — don't animate then. After that,
  // every change of `key` means the user navigated.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // We're between two states: kicked off (this render) and the next
    // route's first render. By the time this `useEffect` runs, Next has
    // already swapped the page — so we use this commit to mark the
    // animation COMPLETE. The "start" is driven by a click listener below.

    setProgress(100);
    const t = setTimeout(() => setVisible(false), 200);
    const t2 = setTimeout(() => setProgress(0), 400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [key]);

  // Global click listener — when any internal <a> / <Link> is clicked, start
  // animating immediately. This is what makes the bar appear in the same
  // frame as the click, before Next has even started the RSC fetch.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      // Skip external, hash, mailto, tel, target=_blank, modified clicks.
      if (
        anchor.target === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.button !== 0
      ) {
        return;
      }
      try {
        // Same-origin guard — leave outbound clicks alone.
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        // If it's the same URL we're already on, don't fire — no nav.
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }

      // Show + animate to ~80% asymptotically. Final 20% is set when the
      // route actually commits in the `pathname` effect above.
      setVisible(true);
      setProgress(15);

      // Cheap exponential approach to 85 so users see continuous motion
      // even on slow routes.
      let p = 15;
      const id = setInterval(() => {
        p = Math.min(85, p + (85 - p) * 0.15);
        setProgress(p);
      }, 100);

      // Safety: clear after 5s if no route change ever fires (e.g. external
      // navigation cancelled the SPA transition).
      const safety = setTimeout(() => {
        clearInterval(id);
        setVisible(false);
        setProgress(0);
      }, 5000);

      const cleanup = () => {
        clearInterval(id);
        clearTimeout(safety);
        document.removeEventListener("navprogress:done", cleanup);
      };
      document.addEventListener("navprogress:done", cleanup);
    };

    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  // When the route effectively committed (key changed), tell click handler
  // to stop the interval.
  useEffect(() => {
    if (!isFirstRender.current) {
      document.dispatchEvent(new CustomEvent("navprogress:done"));
    }
  }, [key]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "2px",
        backgroundColor: "hsl(var(--primary))",
        boxShadow: "0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))",
        transition: "width 0.25s ease-out, opacity 0.25s ease-out",
        opacity: visible ? 1 : 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
