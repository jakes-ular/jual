"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string | null }[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border bg-surface">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-2">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-colors",
                active === i ? "border-primary" : "border-border hover:border-border-strong"
              )}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
