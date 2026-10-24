"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadDetail } from "@/lib/content/dashboard-leads";
import { attorneysByArea } from "@/lib/data/attorneys";
import { cn } from "@/lib/utils";

const NONE = "none";
const copy = leadDetail.assignment;

/**
 * Attorneys who practice `area` first, then the rest. `value` is a user
 * id or undefined for unassigned.
 */
export function AttorneySelect({
  area,
  value,
  onChange,
  allowUnassigned = false,
  placeholder = copy.placeholder,
  id,
  className,
  invalid,
  ...aria
}: {
  area: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  allowUnassigned?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  invalid?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const { inArea, others } = attorneysByArea(area);
  const items = [
    ...(allowUnassigned ? [{ value: NONE, label: copy.unassign }] : []),
    ...[...inArea, ...others].map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <Select
      items={items}
      value={value ?? (allowUnassigned ? NONE : null)}
      onValueChange={(next) =>
        onChange(!next || next === NONE ? undefined : (next as string))
      }
    >
      <SelectTrigger
        id={id}
        aria-invalid={invalid || undefined}
        className={cn("h-9 w-full", className)}
        {...aria}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned && (
          <>
            <SelectItem value={NONE}>{copy.unassign}</SelectItem>
            <SelectSeparator />
          </>
        )}
        {inArea.length > 0 && (
          <SelectGroup>
            <SelectLabel>{copy.groupArea}</SelectLabel>
            {inArea.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {inArea.length > 0 && others.length > 0 && <SelectSeparator />}
        <SelectGroup>
          {inArea.length > 0 && <SelectLabel>{copy.groupOther}</SelectLabel>}
          {others.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
