"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";

import { upsertBrandProfile } from "@/lib/actions/brands";
import { TONE_OPTIONS } from "@/lib/constants";
import type { BrandProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BrandDialog({ brand }: { brand?: BrandProfile }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(brand);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertBrandProfile({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit brand profile">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus />
            New brand profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit brand profile" : "New brand profile"}</DialogTitle>
            <DialogDescription>
              This informs the tone, voice, and audience for every piece of content generated
              under this brand.
            </DialogDescription>
          </DialogHeader>

          {brand && <input type="hidden" name="id" value={brand.id} />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Brand name</Label>
            <Input id="name" name="name" defaultValue={brand?.name} required placeholder="Aurora Skincare" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="industry">Industry / niche</Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={brand?.industry ?? ""}
                placeholder="Skincare & wellness"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tone">Tone of voice</Label>
              <Select name="tone" defaultValue={brand?.tone ?? undefined}>
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audience">Target audience</Label>
            <Textarea
              id="audience"
              name="audience"
              defaultValue={brand?.audience ?? ""}
              placeholder="Women 25-40 interested in clean beauty and self-care rituals"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sample_posts">Sample past posts (optional)</Label>
            <Textarea
              id="sample_posts"
              name="sample_posts"
              defaultValue={brand?.sample_posts ?? ""}
              placeholder="Paste 1-3 posts that capture your brand voice..."
              rows={3}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save changes" : "Create brand profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
