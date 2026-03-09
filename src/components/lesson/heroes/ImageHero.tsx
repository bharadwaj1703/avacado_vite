import { forwardRef } from 'react'

interface ImageHeroProps {
  src: string
  alt: string
}

export const ImageHero = forwardRef<HTMLImageElement, ImageHeroProps>(
  ({ src, alt }, ref) => {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
)
ImageHero.displayName = 'ImageHero'
