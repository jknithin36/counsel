/** h2 used for content sections on inner pages. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] text-[#111]">
      {children}
    </h2>
  );
}
