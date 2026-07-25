"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setWished((data.productIds ?? []).includes(productId)));
  }, [status, productId]);

  async function toggle() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      if (wished) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        setWished(false);
        toast.success("Dihapus dari wishlist");
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setWished(true);
        toast.success("Ditambahkan ke wishlist");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center transition-colors",
        wished ? "border-danger/40 bg-danger/10 text-danger" : "border-border text-muted hover:text-foreground"
      )}
      aria-label="Toggle wishlist"
    >
      <Heart className={cn("h-4.5 w-4.5", wished && "fill-danger")} />
    </button>
  );
}
