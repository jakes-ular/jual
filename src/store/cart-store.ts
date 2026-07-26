"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  image: string | null;
  category: string;
  quantity: number;
  type?: "ASSET" | "TOPUP";
  topupTargetId?: string;
  topupServerId?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            // Topup items always represent one delivery to one game account —
            // re-adding replaces the target ID instead of stacking quantity.
            if (item.type === "TOPUP") {
              return {
                items: state.items.map((i) =>
                  i.productId === item.productId ? { ...i, ...item, quantity: 1 } : i
                ),
              };
            }
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 10) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.type === "TOPUP" ? 1 : quantity }] };
        });
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, 10)) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      isInCart: (productId) => get().items.some((i) => i.productId === productId),
    }),
    { name: "voxmarket-cart" }
  )
);

export function cartItemPrice(item: CartItem): number {
  return item.discountPrice ?? item.price;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + cartItemPrice(i) * i.quantity, 0);
}
