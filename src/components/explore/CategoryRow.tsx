import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { animate } from 'animejs'
import { CATEGORIES } from './category-data'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export function CategoryRow() {
  const [moreOpen, setMoreOpen] = useState(false)
  const mountedRef = useRef(false)

  const setRef = (el: HTMLDivElement | null) => {
    if (el && !mountedRef.current) {
      mountedRef.current = true
      const items = el.querySelectorAll('.cat-item')
      animate(items, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay: (_el: Element, i: number) => i * 50,
        ease: 'outBack',
      })
    }
  }

  return (
    <>
      <div
        ref={setRef}
        className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-2 scrollbar-hide"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          if (cat.id === 'more') {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setMoreOpen(true)}
                className="cat-item flex shrink-0 flex-col items-center gap-2 opacity-0"
              >
                <div className={`flex size-14 items-center justify-center rounded-full ${cat.bg}`}>
                  <Icon className={`size-6 ${cat.iconColor}`} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {cat.label}
                </span>
              </button>
            )
          }
          return (
            <Link
              key={cat.id}
              to="/explore/$categoryId"
              params={{ categoryId: cat.id }}
              className="cat-item flex shrink-0 flex-col items-center gap-2 opacity-0"
            >
              <div className={`flex size-14 items-center justify-center rounded-full ${cat.bg}`}>
                <Icon className={`size-6 ${cat.iconColor}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {cat.label}
              </span>
            </Link>
          )
        })}
      </div>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Explore Categories</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-4 gap-4 px-4 pb-8">
            {CATEGORIES.filter((c) => c.id !== 'more').map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  to="/explore/$categoryId"
                  params={{ categoryId: cat.id }}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`flex size-14 items-center justify-center rounded-full ${cat.bg}`}>
                    <Icon className={`size-6 ${cat.iconColor}`} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {cat.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
