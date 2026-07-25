import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = 14,
  showValue = false,
}: {
  rating: number;
  count?: number;
  size?: number;
  showValue?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              width={size}
              height={size}
              className={cn(filled ? "text-amber-400 fill-amber-400" : "text-muted-2")}
            />
          );
        })}
      </div>
      {showValue && rating > 0 && (
        <span className="text-xs font-medium text-foreground/80">{rating.toFixed(1)}</span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </div>
  );
}
