import { useNavigate } from '@tanstack/react-router'
import {
  CircleDollarSign,
  BookOpen,
  Brain,
  CalendarCheck,
  Trophy,
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

interface CoinDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COIN_TIPS = [
  { icon: BookOpen, text: 'Complete lessons to earn coins' },
  { icon: Brain, text: 'Answer quiz questions correctly' },
  { icon: CalendarCheck, text: 'Log in daily for bonus coins' },
  { icon: Trophy, text: 'Climb the leaderboard for rewards' },
]

export function CoinDrawer({ open, onOpenChange }: CoinDrawerProps) {
  const navigate = useNavigate()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-100">
              <CircleDollarSign className="size-10 text-amber-400" />
            </div>
            <DrawerTitle className="text-2xl">0 Coins</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-6 pb-2">
          {COIN_TIPS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <Button
            className="w-full"
            onClick={() => {
              onOpenChange(false)
              navigate({ to: '/rewards' })
            }}
          >
            Redeem
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
