import { useRef, useCallback } from 'react'
import { animate, createScope, stagger } from 'animejs'

interface AnimatedSVGHeroProps {
  src: string
  animationConfig?: Record<string, unknown>
}

export function AnimatedSVGHero({ src, animationConfig }: AnimatedSVGHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null)
  const svgLoadedRef = useRef(false)

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        scopeRef.current?.revert()
        scopeRef.current = null
        svgLoadedRef.current = false
        return
      }

      containerRef.current = node

      // Load and animate SVG
      fetch(src)
        .then((res) => res.text())
        .then((svgText) => {
          if (!containerRef.current) return

          containerRef.current.innerHTML = svgText
          svgLoadedRef.current = true

          // Create animation scope
          scopeRef.current = createScope({ root: containerRef }).add(() => {
            const svg = containerRef.current?.querySelector('svg')
            if (!svg) return

            // Apply default animations or use provided config
            const paths = svg.querySelectorAll('path, circle, rect, line, polyline')

            if (animationConfig) {
              // Use custom animation config
              animate(paths, animationConfig as Parameters<typeof animate>[1])
            } else {
              // Default reveal animation
              animate(paths, {
                opacity: [0, 1],
                strokeDashoffset: [1000, 0],
                delay: stagger(50),
                duration: 800,
                ease: 'outQuad',
              })
            }
          })
        })
        .catch((err) => {
          console.error('Failed to load SVG:', err)
        })

      // Cleanup function for React 19
      return () => {
        scopeRef.current?.revert()
        scopeRef.current = null
        svgLoadedRef.current = false
      }
    },
    [src, animationConfig]
  )

  return (
    <div
      ref={handleRef}
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted"
    />
  )
}
