import {
  Palette,
  Box,
  Map,
  LayoutTemplate,
  Code2,
  Car,
  Shirt,
  Sparkles,
  Music,
  Cpu,
  Package,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Palette,
  Box,
  Map,
  LayoutTemplate,
  Code2,
  Car,
  Shirt,
  Sparkles,
  Music,
  Cpu,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Package;
  return <Icon className={className} />;
}
