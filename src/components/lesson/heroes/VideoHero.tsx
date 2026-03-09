import { forwardRef, useRef, useImperativeHandle } from 'react'

interface VideoHeroProps {
  src: string
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

export interface VideoHeroRef {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
}

export const VideoHero = forwardRef<VideoHeroRef, VideoHeroProps>(
  ({ src, poster, autoplay = false, loop = false, muted = false }, forwardedRef) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useImperativeHandle(forwardedRef, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }), [])

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline
          className="h-full w-full object-cover"
          preload="metadata"
        />
      </div>
    )
  }
)
VideoHero.displayName = 'VideoHero'
