"use client"

import { useState, useEffect, useRef } from "react"

export interface NewsItem {
  id: string
  text: string
  category?: string
  priority?: "low" | "medium" | "high"
  link?: string
}

interface NewsTickerProps {
  items?: NewsItem[]
  speed?: number
  onItemClick?: (item: NewsItem) => void
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    text: "📱 New smartphone collection launched - Check out the latest tech deals",
    category: "Tech",
    priority: "high",
  },
  {
    id: "2",
    text: "🎉 Limited Time: Get 30% off on Fashion items this weekend",
    category: "Fashion",
    priority: "high",
  },
  {
    id: "3",
    text: "📦 Free shipping on all orders over ₦10000 - No minimum purchases",
    category: "Shipping",
    priority: "medium",
  },
  {
    id: "4",
    text: "⭐ Customer Spotlight: Top sellers are now featured - Apply now",
    category: "Community",
    priority: "medium",
  },
  {
    id: "5",
    text: "🏆 Best Deals of the Week - Electronics up to 40% off",
    category: "Deals",
    priority: "high",
  },
]

export default function NewsTicker({ items = DEFAULT_NEWS, speed = 15, onItemClick }: NewsTickerProps) {
  const [displayItems, setDisplayItems] = useState<NewsItem[]>(items)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayItems([...items, ...items])
  }, [items])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    let animationId: NodeJS.Timeout

    const scroll = () => {
      scrollPosition += 1
      container.scrollLeft = scrollPosition

      // Reset to beginning when reaching end
      if (container.scrollLeft >= container.scrollWidth / 2) {
        scrollPosition = 0
      }

      animationId = setTimeout(scroll, 100 / speed)
    }

    animationId = setTimeout(scroll, 100 / speed)

    return () => clearTimeout(animationId)
  }, [speed])

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-900"
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-900"
      default:
        return "bg-blue-50 border-blue-200 text-blue-900"
    }
  }

  return (
    <section className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-b border-border py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-xs uppercase tracking-wider text-primary whitespace-nowrap">Updates</span>
        </div>

        {/* News Ticker Container - Reduced height and font sizes */}
        <div ref={scrollContainerRef} className="overflow-x-hidden scrollbar-hide">
          <div ref={contentRef} className="flex gap-2 whitespace-nowrap pb-1">
            {displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => {
                  onItemClick?.(item)
                  if (item.link) {
                    window.location.href = item.link
                  }
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border cursor-pointer transition-all duration-300 hover:shadow-sm text-xs ${getPriorityColor(item.priority)}`}
              >
                <span className="font-medium text-xs">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
