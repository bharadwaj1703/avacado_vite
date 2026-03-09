export type BodyMode = 'generated' | 'static'

export interface SubBlobConfig {
  nodes: number
  radius: number
  offsetX: number
  offsetY: number
}

export const DEFAULT_OUTER_BLOBS: SubBlobConfig[] = [
  { nodes: 6, radius: 130, offsetX: 90, offsetY: 75 },
  { nodes: 6, radius: 120, offsetX: 130, offsetY: 95 },
  { nodes: 6, radius: 115, offsetX: 110, offsetY: 140 },
]

export const DEFAULT_INNER_SCALE = 0.78
export const DEFAULT_INNER_OFFSET_Y = -8

export function deriveInnerBlobs(
  outer: SubBlobConfig[],
  scale: number,
  offsetY: number
): SubBlobConfig[] {
  return outer.map((o) => {
    const innerRadius = o.radius * scale
    const centerAlign = o.radius - innerRadius
    return {
      nodes: o.nodes,
      radius: innerRadius,
      offsetX: o.offsetX + centerAlign,
      offsetY: o.offsetY + centerAlign + offsetY,
    }
  })
}
