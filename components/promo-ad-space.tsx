"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export interface PromoAd {
  id: string
  title: string
  description: string
  buttonText: string
  buttonLink?: string
  bgColor?: string
  bgImage?: string
  textColor?: string
}

interface PromoAdSpaceProps {
  ads?: PromoAd[]
  onAdClick?: (ad: PromoAd) => void
}

const DEFAULT_ADS: PromoAd[] = [
  {
    id: "1",
    title: "Summer Sale",
    description: "Get up to 50% off on selected items",
    buttonText: "Shop Now",
    bgColor: "from-orange-400 to-red-500",
    textColor: "text-white",
  },
  {
    id: "2",
    title: "New Arrivals",
    description: "Discover the latest products available now",
    buttonText: "Explore",
    bgColor: "from-blue-500 to-purple-600",
    textColor: "text-white",
  },
  {
    id: "3",
    title: "Free Shipping",
    description: "On orders over $50. Limited time offer!",
    buttonText: "Learn More",
    bgColor: "from-green-400 to-emerald-600",
    textColor: "text-white",
  },
]

export default function PromoAdSpace({ ads = DEFAULT_ADS, onAdClick }: PromoAdSpaceProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay || ads.length === 0) return

    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay, ads.length])

  if (ads.length === 0) return null

  const currentAd = ads[currentAdIndex]

  return (
    <section className="w-full bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Promotional Ad Space */}
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          {/* Background with gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentAd.bgColor} opacity-95`} />

          {/* Background image if provided */}
          {currentAd.bgImage && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${currentAd.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${currentAd.textColor}`}>{currentAd.title}</h2>
              <p className={`text-base md:text-lg ${currentAd.textColor} opacity-90 mb-6`}>{currentAd.description}</p>
              <Button
                onClick={() => {
                  if (currentAd.buttonLink) {
                    window.location.href = currentAd.buttonLink
                  }
                  onAdClick?.(currentAd)
                }}
                className="bg-white hover:bg-gray-100 text-primary font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {currentAd.buttonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Ad Navigation Dots */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentAdIndex(index)
                  setIsAutoPlay(false)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentAdIndex ? "bg-primary w-8" : "bg-muted-foreground hover:bg-muted-foreground/70"
                }`}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
