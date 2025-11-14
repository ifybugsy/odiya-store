"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const slides = [
  {
    id: 1,
    title: "Welcome to bugsymart",
    subtitle: "A new approach to shopping",
    description: "Buy and sell online with ease. Connect with trusted sellers and buyers.",
    bgColor: "from-blue-600 to-blue-400",
    cta: "Start Shopping",
    icon: "🛍️",
    href: "/#items",
  },
  {
    id: 2,
    title: "Become a Seller",
    subtitle: "Monetize Your Marketplace",
    description: "Upload items for just ₦150 and start earning today. Reach thousands of buyers.",
    bgColor: "from-purple-600 to-purple-400",
    cta: "Become a Seller",
    icon: "📦",
    href: "/become-seller",
  },
  {
    id: 3,
    title: "Pick a Ride",
    subtitle: "Fast & Reliable Delivery",
    description: "Get your items delivered quickly. Join our rider network and earn extra income.",
    bgColor: "from-amber-600 to-amber-400",
    cta: "Pick a Ride",
    icon: "🚗",
    href: null,
    action: "pickARide",
  },
  {
    id: 4,
    title: "Safe & Secure",
    subtitle: "Protected Transactions",
    description: "Your data is secure. Trade with confidence on Nigeria's trusted marketplace.",
    bgColor: "from-green-600 to-green-400",
    cta: "Learn More",
    icon: "🔒",
    href: "/",
  },
  {
    id: 5,
    title: "Wide Selection",
    subtitle: "Everything You Need",
    description: "Cars, Electronics, Furniture, Clothing and more. Find anything on bugsymart.",
    bgColor: "from-orange-600 to-orange-400",
    cta: "Browse Categories",
    icon: "🎯",
    href: "/#items",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

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

  const handlePickARide = () => {
    if (user) {
      // If user is logged in and already a rider, go to rider dashboard
      if (user.isRider) {
        router.push("/rider/dashboard")
      } else {
        // Otherwise send to rider registration
        router.push("/rider/register")
      }
    } else {
      // Unauthenticated users go to role selection with rider context
      router.push("/role-selection?from=pick-a-ride")
    }
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
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Content */}
            <div className="flex-1 text-white max-w-2xl">
              <div className="text-5xl md:text-6xl mb-4">{s.icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{s.title}</h1>
              <p className="text-xl md:text-2xl font-semibold mb-4 opacity-90">{s.subtitle}</p>
              <p className="text-base md:text-lg mb-8 opacity-85 max-w-lg">{s.description}</p>
              {s.action === "pickARide" ? (
                <Button
                  onClick={handlePickARide}
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-gray-100 font-semibold"
                >
                  {s.cta}
                </Button>
              ) : (
                <Link href={s.href || "/"}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                    {s.cta}
                  </Button>
                </Link>
              )}
            </div>

            {/* Visual Decoration */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="text-9xl opacity-20">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
