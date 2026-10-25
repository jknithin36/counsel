"use client";

import { useEffect, useRef, useState } from "react";

// "$48M+" → ["$", "48", "M+"]; values without digits ("No fee") stay static.
const NUMERIC = /^(\D*)(\d+(?:\.\d+)?)(.*)$/;
const DURATION = 1200;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Counts the numeric part of `value` up from 0 the first time it scrolls into
 * view. The server renders the final value, and people who prefer reduced
 * motion only ever see the final value. The number is rendered once, so
 * copied text and screen readers get a single clean value.
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(NUMERIC);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per value
  useEffect(() => {
    const el = ref.current;
    if (!match || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [, prefix, number, suffix] = match;
    const target = Number(number);
    const decimals = number.split(".")[1]?.length ?? 0;
    const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          setDisplay(format(target * easeOut(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    // Start from zero only if the strip isn't already on screen.
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) setDisplay(format(0));
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  if (!match) return <span>{value}</span>;

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
