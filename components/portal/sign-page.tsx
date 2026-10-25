"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signPage as copy } from "@/lib/content/portal";
import { signPortalDocument } from "@/lib/data/portal";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";
import { useFirm } from "@/lib/site-content";
import { CardEmpty } from "../dashboard/section-card";
import { PortalPage } from "./shared";
import { usePortal } from "./use-portal";

const back = { href: "/portal/documents", label: copy.back };

/** A simple pointer-driven signature pad. */
function SignaturePad({ onChange }: { onChange: (drawn: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // Match the bitmap to the displayed size so strokes aren't blurred.
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    let drawing = false;
    const down = (e: PointerEvent) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      onChange(true);
    };
    const up = () => {
      drawing = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1">
      <canvas
        ref={ref}
        aria-label={copy.panel.drawLabel}
        className="h-28 w-full touch-none rounded-md border bg-background"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 self-end px-2 text-muted-foreground"
        onClick={() => {
          const c = ref.current;
          c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
          onChange(false);
        }}
      >
        {copy.panel.clear}
      </Button>
    </div>
  );
}

export function SignPage({ docId }: { docId: string }) {
  const id = useId();
  const firm = useFirm();
  const { user, matter } = usePortal();
  const doc = useDemoStore((s) => s.documents.find((d) => d.id === docId));
  // Null until edited, so the signed-in name fills in after hydration.
  const [typed, setTyped] = useState<string | null>(null);
  const name = typed ?? user?.name ?? "";
  const setName = setTyped;
  const [mode, setMode] = useState("type");
  const [drawn, setDrawn] = useState(false);
  const [consent, setConsent] = useState(false);
  const p = copy.panel;

  if (!doc)
    return (
      <PortalPage title={copy.notFound} back={back}>
        <CardEmpty>{copy.notFound}</CardEmpty>
      </PortalPage>
    );

  if (doc.status === "signed")
    return (
      <PortalPage title={doc.name} back={back}>
        <Card className="max-w-xl">
          <CardContent className="flex gap-4">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.5}
              className="size-6 shrink-0"
            />
            <div className="flex flex-col items-start gap-1">
              <p className="text-sm font-medium">{copy.done.title}</p>
              <p className="text-sm text-muted-foreground">
                {copy.done.detail(
                  formatDate(doc.signedAt ?? doc.uploadedAt, true),
                )}
              </p>
              <Button
                size="sm"
                className="mt-3 h-8"
                nativeButton={false}
                render={<Link href="/portal/documents" />}
              >
                {copy.done.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PortalPage>
    );

  const signerName = user?.name ?? name;
  const ready =
    consent && name.trim().length >= 3 && (mode === "type" || drawn);

  return (
    <PortalPage title={doc.name} description={copy.intro} back={back}>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="rounded-md border bg-background px-6 py-10 sm:px-12 sm:py-14">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.08em]">
            {copy.demoLabel}
          </p>
          <h2 className="mt-3 text-[28px] leading-tight">{doc.name}</h2>
          <div className="mt-8 flex max-w-prose flex-col gap-5 text-[15px] leading-7">
            {copy.sample
              .body(signerName, doc.name, matter?.title ?? "", firm.legalName)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
          <p className="mt-12 border-t pt-4 text-xs text-muted-foreground tabular-nums">
            {copy.sample.footer(signerName, matter?.id ?? "")}
          </p>
        </article>

        <Card className="xl:sticky xl:top-20">
          <CardContent>
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (ready) signPortalDocument(doc.id, name.trim());
              }}
            >
              <h2 className="font-sans text-sm font-semibold tracking-normal">
                {p.title}
              </h2>
              <Field>
                <FieldLabel htmlFor={`${id}-name`}>{p.name}</FieldLabel>
                <Input
                  id={`${id}-name`}
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(String(v))}
                className="gap-3"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="type">{p.type}</TabsTrigger>
                  <TabsTrigger value="draw">{p.draw}</TabsTrigger>
                </TabsList>
                <TabsContent value="type">
                  <div className="flex h-28 items-center justify-center rounded-md border bg-background px-4 font-serif text-[30px] italic">
                    {name || (
                      <span className="text-muted-foreground">
                        {p.placeholder}
                      </span>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="draw">
                  <SignaturePad onChange={setDrawn} />
                </TabsContent>
              </Tabs>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">{p.date}</p>
                <p className="mt-1 tabular-nums">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label */}
              <label className="flex items-start gap-2 text-sm leading-relaxed">
                <Checkbox
                  className="mt-0.5"
                  checked={consent}
                  onCheckedChange={(on) => setConsent(on === true)}
                />
                {p.consent}
              </label>
              <Button type="submit" size="sm" className="h-9" disabled={!ready}>
                {p.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalPage>
  );
}
