/**
 * Static body layers extracted from designer SVGs in public/mascot/body-static/.
 * Base and inner layers rendered as clean flat shapes (no blur).
 * Inner layer is center-aligned with base layer.
 * Optional grainy texture overlay with bottom fade.
 */

import { useMemo } from 'react'

const BASE_PATH =
  'M181.681 145.591C177.147 172.631 160.672 183.734 132.256 178.9C103.841 174.066 79.4303 160.546 59.0254 138.34C38.6205 116.134 38.9984 94.6072 60.159 73.7605C81.3196 52.9138 103.614 43.0191 127.042 44.0766C150.469 45.134 166.567 55.5574 175.333 75.3466C184.1 95.1359 186.216 118.551 181.681 145.591Z'

const INNER_PATH =
  'M152.495 124.055C148.922 145.363 135.939 154.113 113.547 150.304C91.1552 146.494 71.9196 135.84 55.8402 118.341C39.7609 100.842 40.0587 83.8792 56.7335 67.4517C73.4084 51.0242 90.9766 43.2271 109.438 44.0603C127.9 44.8936 140.584 53.1074 147.492 68.7016C154.401 84.2959 156.068 102.747 152.495 124.055Z'

// Centroids in original SVG coordinate space
const BASE_CENTER = { x: 112, y: 113 }
const INNER_CENTER = { x: 98, y: 99 }

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

export interface MascotBodyStaticProps {
  baseScale?: number
  baseOffsetX?: number
  baseOffsetY?: number
  innerScale?: number
  grainEnabled?: boolean
  grainFrequency?: number
  grainOctaves?: number
  grainContrast?: number
  grainBrightness?: number
  grainScale?: number
}

/**
 * Compute SVG feComponentTransfer slope/intercept from CSS-style
 * brightness and contrast percentages.
 * CSS `brightness(B) contrast(C)` ≈ slope = B*C, intercept = 0.5*(1-C)
 */
function computeGrainTransfer(contrast: number, brightness: number) {
  const c = contrast / 100
  const b = brightness / 100
  return {
    slope: b * c,
    intercept: 0.5 * (1 - c),
  }
}

export function MascotBodyStatic({
  baseScale = 1.8,
  baseOffsetX = 0,
  baseOffsetY = 0,
  innerScale = 1.0,
  grainEnabled = false,
  grainFrequency = 0.65,
  grainOctaves = 4,
  grainContrast = 200,
  grainBrightness = 150,
  grainScale = 1.0,
}: MascotBodyStaticProps) {
  const baseTX = DEFAULT_BASE_TX + baseOffsetX
  const baseTY = DEFAULT_BASE_TY + baseOffsetY

  // Base center in viewBox coords
  const baseCenterVB = {
    x: BASE_CENTER.x * baseScale + baseTX,
    y: BASE_CENTER.y * baseScale + baseTY,
  }

  // Inner: scale relative to base, center-aligned horizontally and vertically
  const effectiveInnerScale = baseScale * innerScale
  // Solve: INNER_CENTER * effectiveScale + innerT = baseCenterVB
  const innerTX = baseCenterVB.x - INNER_CENTER.x * effectiveInnerScale
  const innerTY = baseCenterVB.y - INNER_CENTER.y * effectiveInnerScale

  const { slope, intercept } = useMemo(
    () => computeGrainTransfer(grainContrast, grainBrightness),
    [grainContrast, grainBrightness]
  )

  // Scale the frequency inversely — higher grainScale = larger noise pattern = lower frequency
  const scaledFrequency = grainFrequency / Math.max(grainScale, 0.01)

  return (
    <>
      {grainEnabled && (
        <defs>
          {/* Grain filter for base layer */}
          <filter id="grain-base" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={scaledFrequency}
              numOctaves={grainOctaves}
              stitchTiles="stitch"
              result="noise"
            />
            <feFlood floodColor="#9FFEC3" result="color" />
            <feBlend in="noise" in2="color" mode="multiply" result="grain" />
            <feComponentTransfer in="grain" result="enhanced">
              <feFuncR type="linear" slope={slope} intercept={intercept} />
              <feFuncG type="linear" slope={slope} intercept={intercept} />
              <feFuncB type="linear" slope={slope} intercept={intercept} />
            </feComponentTransfer>
            <feComposite in="enhanced" in2="SourceAlpha" operator="in" />
          </filter>

          {/* Grain filter for inner layer */}
          <filter id="grain-inner" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={scaledFrequency}
              numOctaves={grainOctaves}
              stitchTiles="stitch"
              result="noise"
            />
            <feFlood floodColor="#B5FFB3" result="color" />
            <feBlend in="noise" in2="color" mode="multiply" result="grain" />
            <feComponentTransfer in="grain" result="enhanced">
              <feFuncR type="linear" slope={slope} intercept={intercept} />
              <feFuncG type="linear" slope={slope} intercept={intercept} />
              <feFuncB type="linear" slope={slope} intercept={intercept} />
            </feComponentTransfer>
            <feComposite in="enhanced" in2="SourceAlpha" operator="in" />
          </filter>

          {/* Gradient mask for grain bottom fade */}
          <linearGradient id="grain-fade-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="1" />
            <stop offset="0.7" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="grain-fade-base">
            <rect x="0" y="0" width="500" height="520" fill="url(#grain-fade-grad)" />
          </mask>
          <mask id="grain-fade-inner">
            <rect x="0" y="0" width="500" height="520" fill="url(#grain-fade-grad)" />
          </mask>
        </defs>
      )}

      {/* Base layer — solid fill */}
      <g className="blob-base-hover">
        <g transform={`translate(${baseTX}, ${baseTY}) scale(${baseScale})`}>
          <path d={BASE_PATH} fill="#9FFEC3" />
        </g>
      </g>

      {/* Base layer — grain overlay with bottom fade */}
      {grainEnabled && (
        <g className="blob-base-hover" opacity="0.6">
          <g mask="url(#grain-fade-base)">
            <g transform={`translate(${baseTX}, ${baseTY}) scale(${baseScale})`}>
              <path d={BASE_PATH} fill="#9FFEC3" filter="url(#grain-base)" />
            </g>
          </g>
        </g>
      )}

      {/* Inner layer — solid fill */}
      {innerScale > 0 && (
        <g className="blob-inner-static-hover">
          <g transform={`translate(${innerTX}, ${innerTY}) scale(${effectiveInnerScale})`}>
            <path d={INNER_PATH} fill="#B5FFB3" />
          </g>
        </g>
      )}

      {/* Inner layer — grain overlay with bottom fade */}
      {grainEnabled && innerScale > 0 && (
        <g className="blob-inner-static-hover" opacity="0.6">
          <g mask="url(#grain-fade-inner)">
            <g transform={`translate(${innerTX}, ${innerTY}) scale(${effectiveInnerScale})`}>
              <path d={INNER_PATH} fill="#B5FFB3" filter="url(#grain-inner)" />
            </g>
          </g>
        </g>
      )}
    </>
  )
}
