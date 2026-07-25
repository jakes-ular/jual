"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatDate, cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

export function ReviewSection({
  productId,
  reviews,
  canReview,
}: {
  productId: string;
  reviews: Review[];
  canReview: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim review");
      toast.success("Review berhasil dikirim");
      setComment("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {canReview && (
        <form onSubmit={submitReview} className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h3 className="font-semibold text-sm">Tulis Review Anda</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const filled = value <= (hoverRating || rating);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={cn("h-6 w-6", filled ? "text-amber-400 fill-amber-400" : "text-muted-2")}
                  />
                </button>
              );
            })}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
            rows={3}
          />
          <Button type="submit" size="sm" loading={submitting}>
            Kirim Review
          </Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">Belum ada review untuk produk ini.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{r.user.name}</span>
                <span className="text-xs text-muted-2">{formatDate(r.createdAt)}</span>
              </div>
              <RatingStars rating={r.rating} size={13} />
              {r.comment && <p className="text-sm text-muted mt-2 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
