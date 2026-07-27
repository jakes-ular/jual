import type { CSSProperties } from "react";

/**
 * Shared between the admin editor's live preview and the public
 * /topup/[slug] page so both render identically. bgColors is a list of hex
 * stops: 0 leaves the default background alone, 1 is a solid color, 2+
 * becomes a linear-gradient. patternUrl (an uploaded, usually
 * semi-transparent texture) is layered as a repeating image on top of
 * whichever of those it's paired with.
 */
export function buildTopupBackgroundStyle(
  bgColors: string[],
  patternUrl?: string | null
): CSSProperties | undefined {
  const colors = bgColors.filter(Boolean);
  const style: CSSProperties = {};
  const imageLayers: string[] = [];
  const repeatLayers: string[] = [];

  if (patternUrl) {
    imageLayers.push(`url(${patternUrl})`);
    repeatLayers.push("repeat");
  }

  if (colors.length >= 2) {
    imageLayers.push(`linear-gradient(135deg, ${colors.join(", ")})`);
    repeatLayers.push("no-repeat");
  } else if (colors.length === 1) {
    style.backgroundColor = colors[0];
  }

  if (imageLayers.length > 0) {
    style.backgroundImage = imageLayers.join(", ");
    style.backgroundRepeat = repeatLayers.join(", ");
  }

  return Object.keys(style).length > 0 ? style : undefined;
}
