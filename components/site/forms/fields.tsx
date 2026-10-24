import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-button border border-[#d4d4d4] bg-white px-4 text-[16px] text-[#111] placeholder:text-[#8a8a8a] aria-invalid:border-[#b42318]";

export const textareaClass = cn(
  inputClass,
  "h-auto min-h-40 py-3 leading-[1.6]",
);

/** aria-describedby value for a field's hint and error. */
export function describedBy(id: string, hasHint?: boolean) {
  return cn(hasHint && `${id}-hint`, `${id}-error`);
}

/**
 * Error slot under a field. Always rendered with a fixed min-height so
 * showing an error doesn't push the layout around.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={`${id}-error`}
      className="mt-1.5 min-h-5 text-[13px] leading-5 text-[#b42318]"
    >
      {message}
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] font-medium text-[#111]">
          {label}
        </label>
        {aside}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      <FieldError id={id} message={error} />
    </div>
  );
}

/** A group of radios or checkboxes with a legend and a linked error. */
export function ChoiceFieldset({
  id,
  legend,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset aria-describedby={describedBy(id, Boolean(hint))}>
      <legend className="text-[15px] font-medium text-[#111]">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-muted-foreground">
          {hint}
        </p>
      )}
      <div className={cn("mt-3", className)}>{children}</div>
      <FieldError id={id} message={error} />
    </fieldset>
  );
}

/**
 * Selectable tile wrapping a visually hidden radio/checkbox. Selected and
 * keyboard-focus styles come from the input inside it.
 */
export const optionTileClass =
  "relative flex cursor-pointer items-center gap-3 rounded-[10px] border border-[#d4d4d4] bg-white px-4 py-3 text-[15px] text-[#111] transition-colors hover:border-[#111] has-checked:border-[#111] has-checked:bg-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#111]";

export const hiddenInputClass = "peer sr-only";
