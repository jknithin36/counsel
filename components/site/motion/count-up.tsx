"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// "$48M+" → ["$", "48", "M+"]; values without digits ("No fee") stay static.
const NUMERIC = /^(\D*)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Counts the numeric part of `value` up from 0 the first time it scrolls into
 * view. The server renders the final value. The number is rendered once, so
 * copied text and screen readers get a single clean value.
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(NUMERIC);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const prefix = match?.[1] ?? "";
  const target = match ? Number(match[2]) : 0;
  const decimals = match?.[2].split(".")[1]?.length ?? 0;
  const suffix = match?.[3] ?? "";
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  // Reset to 0 before the strip is visible, so the count starts from zero.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    if (match && !reduce && !inView) setDisplay(format(0));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: start once in view
  useEffect(() => {
    if (!match || reduce || !inView) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (n) => setDisplay(format(n)),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  if (!match) return <span>{value}</span>;

  return (
    <span ref={ref} className="tabular-nums">
      {reduce ? value : display}
    </span>
  );
}
