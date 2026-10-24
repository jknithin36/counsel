"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signPortalDocument } from "@/lib/data/portal";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";

export function SignPage({ docId }: { docId: string }) {
  const doc = useDemoStore((s) =>
    s.documents.find((item) => item.id === docId),
  );
  const [name, setName] = useState("Maria Delgado");
  const [consent, setConsent] = useState(false);
  const [signed, setSigned] = useState(doc?.status === "signed");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let drawing = false;
    const point = (event: PointerEvent) => ({
      x: event.offsetX,
      y: event.offsetY,
    });
    const down = (event: PointerEvent) => {
      drawing = true;
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const p = point(event);
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineTo(p.x, p.y);
      context.stroke();
    };
    const up = () => {
      drawing = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, []);

  if (!doc)
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Button
          variant="link"
          render={<Link href="/portal/documents" />}
          nativeButton={false}
        >
          ← Documents
        </Button>
        <h1 className="mt-6 text-4xl">Document not found</h1>
      </div>
    );
  if (signed)
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-foreground text-3xl text-background">
          ✓
        </div>
        <h1 className="mt-6 text-4xl">Document signed</h1>
        <p className="mt-3 text-muted-foreground">
          Signed on {formatDate(doc.signedAt ?? new Date().toISOString(), true)}
        </p>
        <Button
          className="mt-8"
          render={<Link href="/portal/documents" />}
          nativeButton={false}
        >
          Back to documents
        </Button>
      </div>
    );
  return (
    <div className="space-y-6">
      <header>
        <Button
          variant="link"
          className="px-0"
          render={<Link href="/portal/documents" />}
          nativeButton={false}
        >
          ← Documents
        </Button>
        <h1 className="mt-2 text-4xl">{doc.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read the full document before signing.
        </p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,760px)_320px]">
        <article className="min-h-[760px] rounded-sm border bg-white p-8 shadow-sm sm:p-14">
          <p className="text-center font-serif text-2xl">
            Medical Records Authorization
          </p>
          <p className="mt-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Fictional demo document
          </p>
          <div className="mt-12 space-y-6 leading-8">
            <p>
              I, <strong>Maria Delgado</strong>, authorize the health care
              providers identified for my matter to provide relevant medical
              records and billing information to Calloway &amp; Reyes.
            </p>
            <p>
              This authorization is limited to information reasonably related to
              the fictional matter <strong>Delgado v. Ridgeline Freight</strong>
              . It may be used by my legal team to evaluate and present my
              claim.
            </p>
            <p>
              I understand that I may ask questions before signing and that I
              may revoke this authorization in writing, except where action has
              already been taken in reliance on it.
            </p>
            <p>
              This sample is provided only to demonstrate the portal signing
              experience. It is not a real authorization and has no legal
              effect.
            </p>
          </div>
          <div className="mt-20 border-t pt-6 text-sm text-muted-foreground">
            Client: Maria Delgado
            <br />
            Matter: M-2026-0142
          </div>
        </article>
        <Card className="xl:sticky xl:top-8">
          <CardHeader>
            <CardTitle>Your signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="legal-name">Full legal name</Label>
              <Input
                id="legal-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <Tabs defaultValue="type">
              <TabsList className="w-full">
                <TabsTrigger value="type">Type</TabsTrigger>
                <TabsTrigger value="draw">Draw instead</TabsTrigger>
              </TabsList>
              <TabsContent value="type">
                <div className="mt-2 flex min-h-24 items-center justify-center rounded-lg border bg-white px-4 font-serif text-3xl italic">
                  {name || "Your signature"}
                </div>
              </TabsContent>
              <TabsContent value="draw">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={120}
                  className="mt-2 w-full touch-none rounded-lg border bg-white"
                  aria-label="Signature drawing pad"
                />
                <Button
                  variant="ghost"
                  className="mt-1"
                  onClick={() =>
                    canvasRef.current
                      ?.getContext("2d")
                      ?.clearRect(0, 0, 300, 140)
                  }
                >
                  Clear
                </Button>
              </TabsContent>
            </Tabs>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p>{formatDate(new Date().toISOString())}</p>
            </div>
            <Label className="flex items-start gap-3 leading-relaxed">
              <Checkbox
                checked={consent}
                onCheckedChange={(value) => setConsent(value === true)}
              />
              I agree to sign this document electronically.
            </Label>
            <Button
              className="w-full"
              disabled={!consent || name.trim().length < 3}
              onClick={() => {
                if (signPortalDocument(doc.id, name.trim())) setSigned(true);
              }}
            >
              Sign &amp; submit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
