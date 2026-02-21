// Centroids in original SVG coordinate space
const BASE_CENTER = { x: 112, y: 113 }

// Default translate to center base layer in 500×520 viewBox
const DEFAULT_BASE_TX = 48
const DEFAULT_BASE_TY = 57

// Face center — base layer centroid in viewBox coords
export function computeStaticCenter(baseScale: number, offsetX: number, offsetY: number) {
  return {
    x: BASE_CENTER.x * baseScale + DEFAULT_BASE_TX + offsetX,
    y: BASE_CENTER.y * baseScale + DEFAULT_BASE_TY + offsetY,
  }
}

export const STATIC_BODY_CENTER = computeStaticCenter(1.8, 0, 0)
