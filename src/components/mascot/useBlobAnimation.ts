import { useRef, useEffect, type MutableRefObject } from 'react'
import { animate } from 'animejs'
import {
  createNodes,
  createControlPoints,
  drawBlobPath,
  type BlobNode,
} from './blob-utils'
import type { SubBlobConfig } from './MascotBlob'

interface UseBlobAnimationOpts {
  outerBlobs: SubBlobConfig[]
  innerBlobs: SubBlobConfig[]
  enabled: boolean
  speed: number
  amplitude: number
}

interface UseBlobAnimationResult {
  outerPathRefs: MutableRefObject<(SVGPathElement | null)[]>
  innerPathRefs: MutableRefObject<(SVGPathElement | null)[]>
}

export function useBlobAnimation({
  outerBlobs,
  innerBlobs,
  enabled,
  speed,
  amplitude,
}: UseBlobAnimationOpts): UseBlobAnimationResult {
  const outerPathRefs = useRef<(SVGPathElement | null)[]>([])
  const innerPathRefs = useRef<(SVGPathElement | null)[]>([])
  const animationsRef = useRef<ReturnType<typeof animate>[]>([])
  const rafRef = useRef<number>(0)
  const needsRedrawRef = useRef(false)

  // Store mutable node arrays for animation
  const outerNodesRef = useRef<BlobNode[][]>([])
  const innerNodesRef = useRef<BlobNode[][]>([])

  useEffect(() => {
    if (!enabled) {
      // Clean up any running animations
      animationsRef.current.forEach((a) => a.pause())
      animationsRef.current = []
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    // Create mutable node arrays for each blob
    const outerNodeArrays = outerBlobs.map((cfg) =>
      createNodes(cfg.nodes, cfg.radius, cfg.offsetX, cfg.offsetY)
    )
    const innerNodeArrays = innerBlobs.map((cfg) =>
      createNodes(cfg.nodes, cfg.radius, cfg.offsetX, cfg.offsetY)
    )

    outerNodesRef.current = outerNodeArrays
    innerNodesRef.current = innerNodeArrays

    const animations: ReturnType<typeof animate>[] = []

    // Animate each node of each blob
    const allNodeArrays = [...outerNodeArrays, ...innerNodeArrays]

    for (const nodes of allNodeArrays) {
      for (const node of nodes) {
        const randDuration = (2500 + Math.random() * 1500) / speed
        const randAmpX = (Math.random() - 0.5) * 2 * amplitude
        const randAmpY = (Math.random() - 0.5) * 2 * amplitude

        const anim = animate(node, {
          x: node.baseX + randAmpX,
          y: node.baseY + randAmpY,
          duration: randDuration,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
          onUpdate: () => {
            needsRedrawRef.current = true
          },
        })
        animations.push(anim)
      }
    }

    animationsRef.current = animations

    // RAF loop to update path 'd' attributes
    function tick() {
      if (needsRedrawRef.current) {
        needsRedrawRef.current = false

        // Update outer paths
        outerNodeArrays.forEach((nodes, i) => {
          const el = outerPathRefs.current[i]
          if (!el) return
          const cfg = outerBlobs[i]
          const cp = createControlPoints(nodes, cfg.nodes, cfg.radius, cfg.offsetX, cfg.offsetY)
          const d = drawBlobPath(nodes, cp)
          el.setAttribute('d', d)
        })

        // Update inner paths
        innerNodeArrays.forEach((nodes, i) => {
          const el = innerPathRefs.current[i]
          if (!el) return
          const cfg = innerBlobs[i]
          const cp = createControlPoints(nodes, cfg.nodes, cfg.radius, cfg.offsetX, cfg.offsetY)
          const d = drawBlobPath(nodes, cp)
          el.setAttribute('d', d)
        })
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      animations.forEach((a) => a.pause())
      animationsRef.current = []
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [outerBlobs, innerBlobs, enabled, speed, amplitude])

  return { outerPathRefs, innerPathRefs }
}
