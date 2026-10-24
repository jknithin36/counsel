"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { uploadPortalDocument } from "@/lib/data/portal";
import type { DocumentCategory } from "@/lib/data/types";

export function UploadDialog({
  requestId,
  trigger,
}: {
  requestId?: string;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = () => {
    if (!file) return;
    uploadPortalDocument({
      file: { name: file.name, size: file.size },
      requestId,
      category,
      comment,
    });
    toast.add({
      title: "Document uploaded",
      description: "Your legal team can now review it.",
      type: "success",
    });
    setOpen(false);
    setFile(null);
    setComment("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button />}>
        {requestId ? "Upload" : "Upload document"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>
            Choose a file from your device. This demo stores only its name,
            type, and size.
          </DialogDescription>
        </DialogHeader>
        {!requestId && (
          <div className="grid gap-2">
            <Label>Document type</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as DocumentCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["medical", "police", "correspondence", "id", "other"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <button
          type="button"
          className="flex min-h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center hover:bg-muted"
          onClick={() => inputRef.current?.click()}
        >
          <span className="font-medium">
            {file?.name ?? "Choose or drop a file"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            PDF, image, Word, or spreadsheet
          </span>
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <div className="grid gap-2">
          <Label htmlFor={`comment-${requestId ?? "general"}`}>
            Comment (optional)
          </Label>
          <Textarea
            id={`comment-${requestId ?? "general"}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a note for your legal team"
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!file}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
