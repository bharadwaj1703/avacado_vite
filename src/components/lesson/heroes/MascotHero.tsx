import { useCallback } from 'react'
import { animate } from 'animejs'
import { MascotBlob } from '@/components/mascot/MascotBlob'
import { Button } from '@/components/ui/button'
import type { EyeVariant } from '@/components/mascot/MascotEyes'
import type { MouthVariant } from '@/components/mascot/MascotMouth'

interface MascotHeroProps {
  eyeVariant?: string
  mouthVariant?: string
  ctaText?: string
  onCtaClick?: () => void
}

export function MascotHero({
  eyeVariant = 'regular',
  mouthVariant = 'smile',
  ctaText = 'Continue',
  onCtaClick,
}: MascotHeroProps) {
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return

    const mascotEl = node.querySelector('.mascot-hero-blob')
    const ctaEl = node.querySelector('.mascot-hero-cta')

    if (mascotEl) {
      animate(mascotEl, {
        translateY: [60, 0],
        opacity: [0, 1],
        duration: 350,
        ease: 'outBack',
      })
    }

    if (ctaEl) {
      animate(ctaEl, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 250,
        ease: 'outQuad',
        delay: 150,
      })
    }
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6">
      <div className="mascot-hero-blob h-48 w-48 opacity-0">
        <MascotBlob
          bodyMode="static"
          staticBaseScale={1.8}
          staticInnerScale={1.0}
          faceScale={1.3}
          faceOffsetY={-35}
          eyeVariant={eyeVariant as EyeVariant}
          mouthVariant={mouthVariant as MouthVariant}
        />
      </div>
      <div className="mascot-hero-cta opacity-0">
        <Button size="lg" onClick={onCtaClick}>
          {ctaText}
        </Button>
      </div>
    </div>
  )
}
