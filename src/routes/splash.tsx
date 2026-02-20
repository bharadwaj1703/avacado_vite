import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { MascotBlob, DEFAULT_OUTER_BLOBS, type SubBlobConfig, type BodyMode } from '@/components/mascot/MascotBlob'
import { MascotSettings } from '@/components/mascot/MascotSettings'
import { PageContainer } from '@/components/layout/PageContainer'
import type { EyeVariant } from '@/components/mascot/MascotEyes'
import type { MouthVariant } from '@/components/mascot/MascotMouth'

function SplashPage() {
  const navigate = useNavigate()

  const [bodyMode, setBodyMode] = useState<BodyMode>('static')
  const [outerBlobs, setOuterBlobs] = useState<SubBlobConfig[]>(DEFAULT_OUTER_BLOBS)
  const [innerScale, setInnerScale] = useState(0.78)
  const [innerOffsetY, setInnerOffsetY] = useState(-8)

  // Static body layer controls
  const [staticBaseScale, setStaticBaseScale] = useState(1.8)
  const [staticBaseOffsetX, setStaticBaseOffsetX] = useState(0)
  const [staticBaseOffsetY, setStaticBaseOffsetY] = useState(0)
  const [staticInnerScale, setStaticInnerScale] = useState(1.0)
  const [eyeVariant, setEyeVariant] = useState<EyeVariant>('regular')
  const [mouthVariant, setMouthVariant] = useState<MouthVariant>('smile')

  // Face controls
  const [faceOffsetX, setFaceOffsetX] = useState(0)
  const [faceOffsetY, setFaceOffsetY] = useState(-35)
  const [faceSpacing, setFaceSpacing] = useState(1.0)
  const [faceScale, setFaceScale] = useState(1.3)

  // Animation controls
  const [animationEnabled, setAnimationEnabled] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(3.0)
  const [animationAmplitude, setAnimationAmplitude] = useState(8)

  // Grain texture controls
  const [grainEnabled, setGrainEnabled] = useState(false)
  const [grainFrequency, setGrainFrequency] = useState(0.65)
  const [grainOctaves, setGrainOctaves] = useState(4)
  const [grainContrast, setGrainContrast] = useState(200)
  const [grainBrightness, setGrainBrightness] = useState(150)
  const [grainScale, setGrainScale] = useState(1.0)

  // Drawer state for layout adjustment
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="relative h-dvh flex flex-col">
      <MascotSettings
        bodyMode={bodyMode}
        outerBlobs={outerBlobs}
        innerScale={innerScale}
        innerOffsetY={innerOffsetY}
        staticBaseScale={staticBaseScale}
        staticBaseOffsetX={staticBaseOffsetX}
        staticBaseOffsetY={staticBaseOffsetY}
        staticInnerScale={staticInnerScale}
        eyeVariant={eyeVariant}
        mouthVariant={mouthVariant}
        faceOffsetX={faceOffsetX}
        faceOffsetY={faceOffsetY}
        faceSpacing={faceSpacing}
        faceScale={faceScale}
        animationEnabled={animationEnabled}
        animationSpeed={animationSpeed}
        animationAmplitude={animationAmplitude}
        onBodyModeChange={setBodyMode}
        onOuterBlobsChange={setOuterBlobs}
        onInnerScaleChange={setInnerScale}
        onInnerOffsetYChange={setInnerOffsetY}
        onStaticBaseScaleChange={setStaticBaseScale}
        onStaticBaseOffsetXChange={setStaticBaseOffsetX}
        onStaticBaseOffsetYChange={setStaticBaseOffsetY}
        onStaticInnerScaleChange={setStaticInnerScale}
        onEyeVariantChange={setEyeVariant}
        onMouthVariantChange={setMouthVariant}
        onFaceOffsetXChange={setFaceOffsetX}
        onFaceOffsetYChange={setFaceOffsetY}
        onFaceSpacingChange={setFaceSpacing}
        onFaceScaleChange={setFaceScale}
        onAnimationEnabledChange={setAnimationEnabled}
        onAnimationSpeedChange={setAnimationSpeed}
        onAnimationAmplitudeChange={setAnimationAmplitude}
        grainEnabled={grainEnabled}
        grainFrequency={grainFrequency}
        grainOctaves={grainOctaves}
        grainContrast={grainContrast}
        grainBrightness={grainBrightness}
        grainScale={grainScale}
        onGrainEnabledChange={setGrainEnabled}
        onGrainFrequencyChange={setGrainFrequency}
        onGrainOctavesChange={setGrainOctaves}
        onGrainContrastChange={setGrainContrast}
        onGrainBrightnessChange={setGrainBrightness}
        onGrainScaleChange={setGrainScale}
        onOpenChange={setDrawerOpen}
      />

      <PageContainer className={`flex flex-1 flex-col items-center justify-center px-6 transition-all ${drawerOpen ? 'pb-[45vh]' : ''}`}>
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Avocado
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            AI to help you work Smarter
          </h1>
        </div>
        <MascotBlob
          className="w-full max-w-[420px] md:max-w-[520px] lg:max-w-[600px]"
          bodyMode={bodyMode}
          staticBaseScale={staticBaseScale}
          staticBaseOffsetX={staticBaseOffsetX}
          staticBaseOffsetY={staticBaseOffsetY}
          staticInnerScale={staticInnerScale}
          eyeVariant={eyeVariant}
          mouthVariant={mouthVariant}
          outerBlobs={outerBlobs}
          innerScale={innerScale}
          innerOffsetY={innerOffsetY}
          faceOffsetX={faceOffsetX}
          faceOffsetY={faceOffsetY}
          faceSpacing={faceSpacing}
          faceScale={faceScale}
          animationEnabled={animationEnabled}
          animationSpeed={animationSpeed}
          animationAmplitude={animationAmplitude}
          grainEnabled={grainEnabled}
          grainFrequency={grainFrequency}
          grainOctaves={grainOctaves}
          grainContrast={grainContrast}
          grainBrightness={grainBrightness}
          grainScale={grainScale}
        />
      </PageContainer>
      <PageContainer className="p-6 pb-10">
        <Button
          className="w-full bg-black text-white hover:bg-black/90"
          size="lg"
          onClick={() => navigate({ to: '/onboarding' })}
        >
          Get Started
        </Button>
      </PageContainer>
    </div>
  )
}

export const Route = createFileRoute('/splash')({
  component: SplashPage,
})
