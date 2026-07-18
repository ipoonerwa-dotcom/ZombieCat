"use client";

import { useEffect } from "react";

// Reveal .reveal elements on scroll: IntersectionObserver + rect fallback
// (some embedded webviews never fire IO).
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (els.length === 0) return;
    const pending = new Set(els);
    let io: IntersectionObserver | null = null;

    const cleanup = () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    const show = (el: HTMLElement) => {
      el.classList.add("in");
      pending.delete(el);
      io?.unobserve(el);
      if (pending.size === 0) cleanup();
    };
    const check = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of Array.from(pending)) {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) show(el);
      }
    };
    try {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && show(e.target as HTMLElement)),
        { threshold: 0.1 }
      );
      els.forEach((el) => io!.observe(el));
    } catch {
      // no IO
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    const t1 = window.setTimeout(check, 80);
    const t2 = window.setTimeout(check, 650);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
