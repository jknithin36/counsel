"use client";

import { PlusSignCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const f = { noOptions: "No options.", clear: "Clear filters" };

/** shadcn data-table style multi-select filter: Popover + Command list. */
export function FacetedFilter({
  title,
  options,
  selected,
  counts,
  onChange,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  counts: Map<string, number>;
  onChange: (values: string[]) => void;
}) {
  const chosen = new Set(selected);
  const toggle = (value: string) => {
    const next = new Set(chosen);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(options.map((o) => o.value).filter((v) => next.has(v)));
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-dashed border-input px-2.5 font-normal"
          />
        }
      >
        <HugeiconsIcon icon={PlusSignCircleIcon} />
        {title}
        {chosen.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4!" />
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal lg:hidden"
            >
              {chosen.size}
            </Badge>
            <span className="hidden gap-1 lg:flex">
              {chosen.size > 2 ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {chosen.size} selected
                </Badge>
              ) : (
                options
                  .filter((o) => chosen.has(o.value))
                  .map((o) => (
                    <Badge
                      key={o.value}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {o.label}
                    </Badge>
                  ))
              )}
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>{f.noOptions}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isOn = chosen.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                    data-checked={isOn || undefined}
                    className="[&>svg:last-child]:hidden"
                  >
                    <Checkbox
                      checked={isOn}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none"
                    />
                    <span className="truncate">{option.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {counts.get(option.value) ?? 0}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {chosen.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    {f.clear}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
