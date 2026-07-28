"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  file: File;
  title: string;
  /** width / height of the crop viewport and the output image */
  aspectRatio: number;
  outputWidth: number;
  outputHeight: number;
  mimeType?: "image/jpeg" | "image/png";
  onCancel: () => void;
  onCropped: (file: File) => void;
}

/**
 * Minimal pan/zoom cropper: the source image always covers the fixed-aspect
 * viewport (like CSS object-cover), the user drags to reposition and uses
 * the slider to zoom in, then Terapkan rasterizes the visible viewport rect
 * onto an outputWidth x outputHeight canvas.
 */
export function ImageCropper({
  file,
  title,
  aspectRatio,
  outputWidth,
  outputHeight,
  mimeType = "image/jpeg",
  onCancel,
  onCropped,
}: ImageCropperProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const baseScaleRef = useRef(1);

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    // Create + revoke must be paired in this one effect: Strict Mode's dev-only
    // mount -> cleanup -> mount cycle would otherwise revoke a URL that's still in use.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function clampToViewport(nx: number, ny: number, dispW: number, dispH: number) {
    const vp = viewportRef.current;
    if (!vp) return { x: nx, y: ny };
    const minX = Math.min(0, vp.clientWidth - dispW);
    const minY = Math.min(0, vp.clientHeight - dispH);
    return { x: Math.min(0, Math.max(minX, nx)), y: Math.min(0, Math.max(minY, ny)) };
  }

  function handleImageLoad() {
    const img = imgRef.current;
    const vp = viewportRef.current;
    if (!img || !vp) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const base = Math.max(vp.clientWidth / w, vp.clientHeight / h);
    baseScaleRef.current = base;
    setNatural({ w, h });
    setZoom(1);
    setScale(base);
    setPos(clampToViewport((vp.clientWidth - w * base) / 2, (vp.clientHeight - h * base) / 2, w * base, h * base));
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos(
      clampToViewport(
        dragState.current.posX + dx,
        dragState.current.posY + dy,
        natural.w * scale,
        natural.h * scale
      )
    );
  }

  function onPointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(z: number) {
    const vp = viewportRef.current;
    if (!vp || !natural.w) {
      setZoom(z);
      return;
    }
    const newScale = baseScaleRef.current * z;
    const centerX = vp.clientWidth / 2;
    const centerY = vp.clientHeight / 2;
    const imgCenterXOld = (centerX - pos.x) / scale;
    const imgCenterYOld = (centerY - pos.y) / scale;
    setZoom(z);
    setScale(newScale);
    setPos(
      clampToViewport(
        centerX - imgCenterXOld * newScale,
        centerY - imgCenterYOld * newScale,
        natural.w * newScale,
        natural.h * newScale
      )
    );
  }

  function handleApply() {
    const vp = viewportRef.current;
    const img = imgRef.current;
    if (!vp || !img || !natural.w) return;
    const sourceX = -pos.x / scale;
    const sourceY = -pos.y / scale;
    const sourceW = vp.clientWidth / scale;
    const sourceH = vp.clientHeight / scale;

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, outputWidth, outputHeight);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = mimeType === "image/png" ? "png" : "jpg";
        onCropped(new File([blob], `crop.${ext}`, { type: mimeType }));
      },
      mimeType,
      0.92
    );
  }

  if (typeof document === "undefined") return null;

  const dispW = natural.w ? natural.w * scale : undefined;
  const dispH = natural.h ? natural.h * scale : undefined;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass p-6 glow-ring">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden rounded-xl border border-border bg-surface-2 touch-none select-none cursor-grab active:cursor-grabbing"
          style={{ aspectRatio: String(aspectRatio) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- cropping needs a plain <img> for canvas drawImage + blob: URL support
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="absolute top-0 left-0 max-w-none pointer-events-none"
              style={{ width: dispW, height: dispH, transform: `translate(${pos.x}px, ${pos.y}px)` }}
            />
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <ZoomIn className="h-4 w-4 text-muted-2 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <p className="text-xs text-muted-2 mt-2">Geser gambar untuk mengatur posisi, gunakan slider untuk zoom.</p>

        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
          <Button type="button" onClick={handleApply}>
            Terapkan
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
