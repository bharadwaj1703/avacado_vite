import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings } from 'lucide-react'
import type { SubBlobConfig, BodyMode } from './MascotBlob'
import type { EyeVariant } from './MascotEyes'
import type { MouthVariant } from './MascotMouth'

interface MascotSettingsProps {
  bodyMode: BodyMode
  outerBlobs: SubBlobConfig[]
  innerScale: number
  innerOffsetY: number
  staticBaseScale: number
  staticBaseOffsetX: number
  staticBaseOffsetY: number
  staticInnerScale: number
  eyeVariant: EyeVariant
  mouthVariant: MouthVariant
  faceOffsetX: number
  faceOffsetY: number
  faceSpacing: number
  faceScale: number
  animationEnabled: boolean
  animationSpeed: number
  animationAmplitude: number
  grainEnabled: boolean
  grainFrequency: number
  grainOctaves: number
  grainContrast: number
  grainBrightness: number
  grainScale: number
  onGrainEnabledChange: (value: boolean) => void
  onBodyModeChange: (mode: BodyMode) => void
  onOuterBlobsChange: (blobs: SubBlobConfig[]) => void
  onInnerScaleChange: (value: number) => void
  onInnerOffsetYChange: (value: number) => void
  onStaticBaseScaleChange: (value: number) => void
  onStaticBaseOffsetXChange: (value: number) => void
  onStaticBaseOffsetYChange: (value: number) => void
  onStaticInnerScaleChange: (value: number) => void
  onEyeVariantChange: (value: EyeVariant) => void
  onMouthVariantChange: (value: MouthVariant) => void
  onFaceOffsetXChange: (value: number) => void
  onFaceOffsetYChange: (value: number) => void
  onFaceSpacingChange: (value: number) => void
  onFaceScaleChange: (value: number) => void
  onAnimationEnabledChange: (value: boolean) => void
  onAnimationSpeedChange: (value: number) => void
  onAnimationAmplitudeChange: (value: number) => void
  onGrainFrequencyChange: (value: number) => void
  onGrainOctavesChange: (value: number) => void
  onGrainContrastChange: (value: number) => void
  onGrainBrightnessChange: (value: number) => void
  onGrainScaleChange: (value: number) => void
  onOpenChange?: (open: boolean) => void
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Number.isInteger(step) ? Math.round(value) : value.toFixed(2)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

export function MascotSettings({
  bodyMode,
  outerBlobs,
  innerScale,
  innerOffsetY,
  staticBaseScale,
  staticBaseOffsetX,
  staticBaseOffsetY,
  staticInnerScale,
  eyeVariant,
  mouthVariant,
  faceOffsetX,
  faceOffsetY,
  faceSpacing,
  faceScale,
  animationEnabled,
  animationSpeed,
  animationAmplitude,
  onBodyModeChange,
  onOuterBlobsChange,
  onInnerScaleChange,
  onInnerOffsetYChange,
  onStaticBaseScaleChange,
  onStaticBaseOffsetXChange,
  onStaticBaseOffsetYChange,
  onStaticInnerScaleChange,
  onEyeVariantChange,
  onMouthVariantChange,
  onFaceOffsetXChange,
  onFaceOffsetYChange,
  onFaceSpacingChange,
  onFaceScaleChange,
  onAnimationEnabledChange,
  onAnimationSpeedChange,
  onAnimationAmplitudeChange,
  grainEnabled,
  grainFrequency,
  grainOctaves,
  grainContrast,
  grainBrightness,
  grainScale,
  onGrainEnabledChange,
  onGrainFrequencyChange,
  onGrainOctavesChange,
  onGrainContrastChange,
  onGrainBrightnessChange,
  onGrainScaleChange,
  onOpenChange,
}: MascotSettingsProps) {
  function updateBlob(index: number, field: keyof SubBlobConfig, value: number) {
    const updated = outerBlobs.map((blob, i) =>
      i === index ? { ...blob, [field]: value } : blob
    )
    onOuterBlobsChange(updated)
  }

  return (
    <Drawer modal={false} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent noOverlay className="max-h-[55vh]">
        <DrawerHeader>
          <DrawerTitle>Mascot Settings</DrawerTitle>
          <DrawerDescription>Tune the blob shape and face in real-time.</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6">
          <Accordion type="multiple" defaultValue={['body']}>
            {/* Body */}
            <AccordionItem value="body">
              <AccordionTrigger>Body</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Body Mode</Label>
                  <Select value={bodyMode} onValueChange={(v) => onBodyModeChange(v as BodyMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static (Designer)</SelectItem>
                      <SelectItem value="generated">Generated (Procedural)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {bodyMode === 'static' ? (
                  <>
                    <SliderField
                      label="Base Scale"
                      value={staticBaseScale}
                      min={0.5}
                      max={3.0}
                      step={0.05}
                      onChange={onStaticBaseScaleChange}
                    />
                    <SliderField
                      label="Base Offset X"
                      value={staticBaseOffsetX}
                      min={-100}
                      max={100}
                      step={1}
                      onChange={onStaticBaseOffsetXChange}
                    />
                    <SliderField
                      label="Base Offset Y"
                      value={staticBaseOffsetY}
                      min={-100}
                      max={100}
                      step={1}
                      onChange={onStaticBaseOffsetYChange}
                    />
                    <SliderField
                      label="Inner Layer Scale"
                      value={staticInnerScale}
                      min={0}
                      max={5.0}
                      step={0.01}
                      onChange={onStaticInnerScaleChange}
                    />
                  </>
                ) : (
                  <>
                    <SliderField
                      label="Inner Scale"
                      value={innerScale}
                      min={0.4}
                      max={0.9}
                      step={0.01}
                      onChange={onInnerScaleChange}
                    />
                    <SliderField
                      label="Inner Y Shift"
                      value={innerOffsetY}
                      min={-60}
                      max={60}
                      step={1}
                      onChange={onInnerOffsetYChange}
                    />
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Sub-blobs — only for generated mode */}
            {bodyMode === 'generated' && <AccordionItem value="sub-blobs">
              <AccordionTrigger>Sub-blobs</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {outerBlobs.map((blob, i) => (
                  <div key={i} className="space-y-3 rounded-md border p-3">
                    <p className="text-xs font-medium text-muted-foreground">Blob {i + 1}</p>
                    <SliderField
                      label="Radius"
                      value={blob.radius}
                      min={60}
                      max={180}
                      step={1}
                      onChange={(v) => updateBlob(i, 'radius', v)}
                    />
                    <SliderField
                      label="Offset X"
                      value={blob.offsetX}
                      min={-50}
                      max={250}
                      step={1}
                      onChange={(v) => updateBlob(i, 'offsetX', v)}
                    />
                    <SliderField
                      label="Offset Y"
                      value={blob.offsetY}
                      min={-50}
                      max={250}
                      step={1}
                      onChange={(v) => updateBlob(i, 'offsetY', v)}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>}

            {/* Face */}
            <AccordionItem value="face">
              <AccordionTrigger>Face</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Eyes</Label>
                  <Select value={eyeVariant} onValueChange={(v) => onEyeVariantChange(v as EyeVariant)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="shy">Shy</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Mouth</Label>
                  <Select value={mouthVariant} onValueChange={(v) => onMouthVariantChange(v as MouthVariant)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smile">Smile</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="grin">Grin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <SliderField
                  label="Face Offset X"
                  value={faceOffsetX}
                  min={-50}
                  max={50}
                  step={1}
                  onChange={onFaceOffsetXChange}
                />
                <SliderField
                  label="Face Offset Y"
                  value={faceOffsetY}
                  min={-50}
                  max={50}
                  step={1}
                  onChange={onFaceOffsetYChange}
                />
                <SliderField
                  label="Face Spacing"
                  value={faceSpacing}
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  onChange={onFaceSpacingChange}
                />
                <SliderField
                  label="Face Scale"
                  value={faceScale}
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  onChange={onFaceScaleChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Animation */}
            <AccordionItem value="animation">
              <AccordionTrigger>Animation</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="animation-enabled"
                    checked={animationEnabled}
                    onCheckedChange={(checked) => onAnimationEnabledChange(checked === true)}
                  />
                  <Label htmlFor="animation-enabled" className="text-xs text-muted-foreground">
                    Enable Animation
                  </Label>
                </div>
                <SliderField
                  label="Speed"
                  value={animationSpeed}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  onChange={onAnimationSpeedChange}
                />
                <SliderField
                  label="Amplitude"
                  value={animationAmplitude}
                  min={2}
                  max={20}
                  step={1}
                  onChange={onAnimationAmplitudeChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Grain Texture */}
            <AccordionItem value="grain">
              <AccordionTrigger>Grain Texture</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="grain-enabled"
                    checked={grainEnabled}
                    onCheckedChange={(checked) => onGrainEnabledChange(checked === true)}
                  />
                  <Label htmlFor="grain-enabled" className="text-xs text-muted-foreground">
                    Enable Grain
                  </Label>
                </div>
                <SliderField
                  label="Frequency"
                  value={grainFrequency}
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  onChange={onGrainFrequencyChange}
                />
                <SliderField
                  label="Scale"
                  value={grainScale}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  onChange={onGrainScaleChange}
                />
                <SliderField
                  label="Octaves"
                  value={grainOctaves}
                  min={1}
                  max={8}
                  step={1}
                  onChange={onGrainOctavesChange}
                />
                <SliderField
                  label="Contrast"
                  value={grainContrast}
                  min={0}
                  max={500}
                  step={10}
                  onChange={onGrainContrastChange}
                />
                <SliderField
                  label="Brightness"
                  value={grainBrightness}
                  min={0}
                  max={700}
                  step={10}
                  onChange={onGrainBrightnessChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
