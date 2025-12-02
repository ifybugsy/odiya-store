"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VendorCatalogSliderProps {
  catalogImages: string[]
  storeName: string
}

export default function VendorCatalogSlider({ catalogImages, storeName }: VendorCatalogSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || catalogImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % catalogImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, catalogImages.length])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev === 0 ? catalogImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % catalogImages.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  if (!catalogImages || catalogImages.length === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative w-full h-80 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
          <Images className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Catalog Gallery</span>
        </div>

        <img
          src={catalogImages[currentIndex] || "/placeholder.svg"}
          alt={`${storeName} catalog ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        {catalogImages.length > 1 && (
          <>
            <Button
              onClick={handlePrevious}
              size="sm"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/95 rounded-full p-2 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleNext}
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/95 rounded-full p-2 shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2">
              {catalogImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {currentIndex + 1}/{catalogImages.length}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
