"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "Welcome to Odiya Store",
    subtitle: "A new approach to shopping",
    description: "Buy and sell online with ease. Connect with trusted sellers and buyers.",
    bgColor: "from-blue-600 to-blue-400",
    cta: "Start Shopping",
    icon: "🛍️",
  },
  {
    id: 2,
    title: "Become a Seller",
    subtitle: "Monetize Your Marketplace",
    description: "Upload items for just ₦500 and start earning today. Reach thousands of buyers.",
    bgColor: "from-purple-600 to-purple-400",
    cta: "Become a Seller",
    icon: "📦",
  },
  {
    id: 3,
    title: "Safe & Secure",
    subtitle: "Protected Transactions",
    description: "Your data is secure. Trade with confidence on Nigeria's trusted marketplace.",
    bgColor: "from-green-600 to-green-400",
    cta: "Learn More",
    icon: "🔒",
  },
  {
    id: 4,
    title: "Wide Selection",
    subtitle: "Everything You Need",
    description: "Cars, Electronics, Furniture, Clothing and more. Find anything on Odiya Store.",
    bgColor: "from-orange-600 to-orange-400",
    cta: "Browse Categories",
    icon: "🎯",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [autoPlay])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setAutoPlay(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setAutoPlay(false)
  }

  const slide = slides[currentSlide]

  return (
    <div
      className="relative w-full h-96 md:h-[500px] bg-gradient-to-r overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-between px-8 md:px-16 bg-gradient-to-r ${s.bgColor} ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Content */}
            <div className="flex-1 text-white max-w-2xl">
              <div className="text-5xl md:text-6xl mb-4">{s.icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{s.title}</h1>
              <p className="text-xl md:text-2xl font-semibold mb-4 opacity-90">{s.subtitle}</p>
              <p className="text-base md:text-lg mb-8 opacity-85 max-w-lg">{s.description}</p>
              <Link href={index === 1 ? "/become-seller" : index === 0 ? "/#items" : "/"}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  {s.cta}
                </Button>
              </Link>
            </div>

            {/* Visual Decoration */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="text-9xl opacity-20">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 transition rounded-full p-2 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 transition rounded-full p-2 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
