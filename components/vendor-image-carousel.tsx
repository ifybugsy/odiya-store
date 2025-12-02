"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface VendorImageCarouselProps {
  images: string[]
  storeName: string
}

export default function VendorImageCarousel({ images, storeName }: VendorImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const validImages = images.filter((img) => img && img.trim())

  useEffect(() => {
    if (!autoPlay || validImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay, validImages.length])

  if (!validImages || validImages.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
    setAutoPlay(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
    setAutoPlay(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setAutoPlay(false)
  }

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Main Carousel */}
        <div className="relative w-full bg-muted/50">
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            {validImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${storeName} - Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/placeholder.svg?height=500&width=800&query=${storeName} store image`
                  }}
                />
              </div>
            ))}

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black border-0 z-10 rounded-full"
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black border-0 z-10 rounded-full"
                  onClick={goToNext}
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Slide Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {validImages.length}
            </div>
          </div>

          {/* Indicator Dots */}
          {validImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 bg-muted/30 p-4">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="p-6 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-2">{storeName} Showcase</h3>
          <p className="text-sm text-muted-foreground">
            Browse through our store's featured images to get a better look at our offerings and store environment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
