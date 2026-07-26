export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  status: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  salesCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string | Date;
  category: { name: string; slug: string };
  images: { url: string; alt: string | null }[];
}
