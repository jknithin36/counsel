"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { editorCopy as copy } from "@/lib/content/dashboard-admin";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TipButton } from "./tip-button";

/*
 * Building blocks for the Content and Settings editors: a card with its own
 * Save, dirty tracking the page can ask about, sortable lists and repeaters.
 */

/** True when the draft differs from what's published. */
export function useDirty<T>(draft: T, live: T) {
  return useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(live),
    [draft, live],
  );
}

const DirtyContext = createContext<(dirty: boolean) => void>(() => {});
export const DirtyReporter = DirtyContext.Provider;

/** Tells the surrounding page whether this editor has unsaved changes. */
export function useReportDirty(dirty: boolean) {
  const report = useContext(DirtyContext);
  useEffect(() => {
    report(dirty);
    return () => report(false);
  }, [dirty, report]);
}

/** Warns before closing or reloading the tab while `dirty`. */
export function useUnloadWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

export type EditorKind = "content" | "settings";

/** "Last published 5m ago by …" for content, "Last saved …" for settings. */
export function PublishedLine({
  published,
  kind = "content",
}: {
  published?: { at: string; by: string };
  kind?: EditorKind;
}) {
  if (!published)
    return (
      <span className="text-xs text-muted-foreground">
        {kind === "content" ? copy.neverPublished : copy.neverSaved}
      </span>
    );
  const ago = timeAgo(published.at).toLowerCase();
  return (
    <span className="text-xs text-muted-foreground">
      {kind === "content"
        ? copy.published(ago, published.by)
        : copy.savedBy(ago, published.by)}
    </span>
  );
}

/** One editor: title, fields, and a footer with its own Save. */
export function EditorCard({
  title,
  description,
  action,
  published,
  kind,
  dirty,
  canSave = true,
  disabledReason,
  onSave,
  onDiscard,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  published?: { at: string; by: string };
  kind?: EditorKind;
  dirty: boolean;
  /** False while the draft is invalid. */
  canSave?: boolean;
  /** When set, the editor is read-only and Save explains why. */
  disabledReason?: string;
  onSave: () => void;
  onDiscard: () => void;
  children: ReactNode;
  className?: string;
}) {
  useReportDirty(dirty);
  useUnloadWarning(dirty);

  const save = (
    <Button
      type="submit"
      size="sm"
      className="h-8"
      disabled={!dirty || !canSave || Boolean(disabledReason)}
    >
      {copy.save}
    </Button>
  );

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && canSave && !disabledReason) onSave();
        }}
      >
        <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b py-4">
          <div className="min-w-0">
            <CardTitle className="font-sans text-sm font-semibold">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1 text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
        <CardContent className="py-5">
          <fieldset
            disabled={Boolean(disabledReason)}
            className="flex min-w-0 flex-col gap-5"
          >
            {children}
          </fieldset>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t py-3">
          {dirty ? (
            <span className="text-xs font-medium text-foreground">
              {copy.unsaved}
            </span>
          ) : (
            <PublishedLine published={published} kind={kind} />
          )}
          <div className="flex gap-2">
            {dirty && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={onDiscard}
              >
                {copy.discard}
              </Button>
            )}
            {disabledReason ? (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  {save}
                </TooltipTrigger>
                <TooltipContent>{disabledReason}</TooltipContent>
              </Tooltip>
            ) : (
              save
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

/** A small icon button with a tooltip and an accessible name. */
export function IconAction({
  label,
  icon,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: IconSvgElement;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <TipButton
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("text-muted-foreground", className)}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} />
    </TipButton>
  );
}

/* --------------------------------------------------------------- */
/* Sortable lists                                                   */
/* --------------------------------------------------------------- */

function SortableRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "relative flex items-center gap-2 bg-card py-2.5",
        isDragging && "z-10 rounded-md shadow-md ring-1 ring-border",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={copy.dragHandle(label)}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
      >
        <HugeiconsIcon
          icon={DragDropVerticalIcon}
          strokeWidth={2}
          className="size-4"
        />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
    </li>
  );
}

/**
 * A vertical list reordered by dragging the handle, or with the keyboard:
 * focus the handle, Space to lift, arrows to move, Space to drop.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ids = items.map(getId);

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={cn("flex flex-col divide-y", className)}>
          {items.map((item, i) => (
            <SortableRow
              key={getId(item)}
              id={getId(item)}
              label={getLabel(item)}
            >
              {renderItem(item, i)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/* --------------------------------------------------------------- */
/* Repeaters                                                        */
/* --------------------------------------------------------------- */

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  return arrayMove(list, from, to);
}

function RowControls({
  index,
  count,
  onMove,
  onRemove,
  name,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  name: string;
}) {
  return (
    <div className="flex shrink-0 gap-0.5">
      <IconAction
        label={`${copy.moveUp}: ${name}`}
        icon={ArrowUp01Icon}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      />
      <IconAction
        label={`${copy.moveDown}: ${name}`}
        icon={ArrowDown01Icon}
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
      />
      <IconAction
        label={`${copy.removeRow}: ${name}`}
        icon={Delete02Icon}
        onClick={onRemove}
      />
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 self-start"
      onClick={onClick}
    >
      <HugeiconsIcon
        icon={Add01Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {label}
    </Button>
  );
}

/** A list of title + body pairs (common cases, FAQ entries…). */
export function PairRepeater<K extends string, V extends string>({
  label,
  items,
  onChange,
  keys,
  labels,
}: {
  label: string;
  items: Record<K | V, string>[];
  onChange: (items: Record<K | V, string>[]) => void;
  keys: [K, V];
  labels: [string, string];
}) {
  const id = useId();
  const [k, v] = keys;
  const update = (i: number, field: K | V, value: string) =>
    onChange(
      items.map((item, j) => (j === i ? { ...item, [field]: value } : item)),
    );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {items.map((item, i) => {
        const name = item[k] || `${label} ${i + 1}`;
        return (
          // Rows have no stable id; position is their identity here.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          <div key={i} className="flex gap-2 rounded-md border p-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Field>
                <FieldLabel htmlFor={`${id}-${i}-k`} className="text-xs">
                  {labels[0]}
                </FieldLabel>
                <Input
                  id={`${id}-${i}-k`}
                  value={item[k]}
                  onChange={(e) => update(i, k, e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-${i}-v`} className="text-xs">
                  {labels[1]}
                </FieldLabel>
                <Textarea
                  id={`${id}-${i}-v`}
                  rows={2}
                  value={item[v]}
                  onChange={(e) => update(i, v, e.target.value)}
                />
              </Field>
            </div>
            <RowControls
              index={i}
              count={items.length}
              name={name}
              onMove={(to) => onChange(move(items, i, to))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
        );
      })}
      <AddRow
        label={`${copy.addRow}: ${label.toLowerCase()}`}
        onClick={() =>
          onChange([...items, { [k]: "", [v]: "" } as Record<K | V, string>])
        }
      />
    </fieldset>
  );
}

/** A list of single-line strings (focus areas, admissions…). */
export function ListRepeater({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
        <div key={i} className="flex items-center gap-2">
          <Input
            id={`${id}-${i}`}
            aria-label={`${label} ${i + 1}`}
            value={item}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          <RowControls
            index={i}
            count={items.length}
            name={item || `${label} ${i + 1}`}
            onMove={(to) => onChange(move(items, i, to))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <AddRow
        label={`${copy.addRow}: ${label.toLowerCase()}`}
        onClick={() => onChange([...items, ""])}
      />
    </fieldset>
  );
}
