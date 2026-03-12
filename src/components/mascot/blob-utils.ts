export interface BlobNode {
  id: number
  x: number
  y: number
  baseX: number
  baseY: number
  angle: number
}

export interface ControlPoint {
  c1x: number
  c1y: number
  c2x: number
  c2y: number
}

export function rotate(
  cx: number,
  cy: number,
  x: number,
  y: number,
  radians: number
): [number, number] {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * (x - cx) + sin * (y - cy) + cx
  const ny = cos * (y - cy) - sin * (x - cx) + cy
  return [nx, ny]
}

export function createNodes(
  totalNodes: number,
  radius: number,
  offsetX: number,
  offsetY: number
): BlobNode[] {
  const nodes: BlobNode[] = []
  const width = radius * 2

  for (let i = 0; i < totalNodes; i++) {
    const angle = (i / (totalNodes / 2)) * Math.PI
    const x = radius * Math.cos(angle) + width / 2
    const y = radius * Math.sin(angle) + width / 2

    nodes.push({
      id: i,
      x: x + offsetX,
      y: y + offsetY,
      baseX: x + offsetX,
      baseY: y + offsetY,
      angle,
    })
  }

  return nodes
}

export function createControlPoints(
  nodes: BlobNode[],
  totalNodes: number,
  radius: number,
  offsetX: number,
  offsetY: number
): ControlPoint[] {
  const idealCPDistance =
    (4 / 3) * Math.tan(Math.PI / (2 * totalNodes)) * radius

  const cp0: ControlPoint = {
    c1x: nodes[0].x,
    c1y: nodes[0].y - idealCPDistance,
    c2x: nodes[0].x,
    c2y: nodes[0].y + idealCPDistance,
  }

  return nodes.map((n, i) => {
    if (i === 0) return cp0

    const angle = -n.angle
    const [c1x, c1y] = rotate(
      radius + offsetX,
      radius + offsetY,
      cp0.c1x,
      cp0.c1y,
      angle
    )
    const [c2x, c2y] = rotate(
      radius + offsetX,
      radius + offsetY,
      cp0.c2x,
      cp0.c2y,
      angle
    )

    return { c1x, c1y, c2x, c2y }
  })
}

export function drawBlobPath(
  nodes: BlobNode[],
  controlPoints: ControlPoint[]
): string {
  const last = nodes[nodes.length - 1]
  const curves = nodes
    .map((n, i) => {
      const prevCP =
        i === 0
          ? controlPoints[controlPoints.length - 1]
          : controlPoints[i - 1]
      const currCP = controlPoints[i]
      return `C ${prevCP.c2x} ${prevCP.c2y}, ${currCP.c1x} ${currCP.c1y}, ${n.x} ${n.y}`
    })
    .join(' ')

  return `M ${last.x} ${last.y} ${curves} Z`
}
