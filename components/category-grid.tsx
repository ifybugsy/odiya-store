"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import {
  Smartphone,
  Laptop,
  Home,
  Briefcase,
  Shirt,
  Truck,
  Wrench,
  Heart,
  Baby,
  Building2,
  Leaf,
  Hammer,
  PawPrint,
  Wine,
  Sprout,
  Store,
} from "lucide-react"

interface Category {
  id: string
  displayName: string
  apiName: string
  icon: React.ReactNode
  color: string
  bgColor: string
  isVendorLink?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: "become-vendor",
    displayName: "Become a Vendor",
    apiName: "Become a Vendor",
    icon: <Store className="w-12 h-12" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    isVendorLink: true,
  },
  {
    id: "home-garden",
    displayName: "Home & Garden",
    apiName: "Home & Garden",
    icon: <Sprout className="w-12 h-12" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    id: "vehicles",
    displayName: "Vehicles",
    apiName: "Cars",
    icon: <Truck className="w-12 h-12" />,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    id: "phones",
    displayName: "Phones & Tablets",
    apiName: "Phones",
    icon: <Smartphone className="w-12 h-12" />,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "electronics",
    displayName: "Electronics & Computers",
    apiName: "Electronics",
    icon: <Laptop className="w-12 h-12" />,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    id: "furniture",
    displayName: "Furniture",
    apiName: "Furniture",
    icon: <Home className="w-12 h-12" />,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: "fashion",
    displayName: "Fashion",
    apiName: "Clothing",
    icon: <Shirt className="w-12 h-12" />,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    id: "jobs",
    displayName: "Jobs",
    apiName: "Jobs",
    icon: <Briefcase className="w-12 h-12" />,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    id: "services",
    displayName: "Services",
    apiName: "Services",
    icon: <Wrench className="w-12 h-12" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: "health",
    displayName: "Health & Beauty",
    apiName: "Health & Beauty",
    icon: <Heart className="w-12 h-12" />,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    id: "babies",
    displayName: "Babies & Children",
    apiName: "Babies & Children",
    icon: <Baby className="w-12 h-12" />,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    id: "construction",
    displayName: "Construction & Repair",
    apiName: "Construction & Repair",
    icon: <Hammer className="w-12 h-12" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    id: "food",
    displayName: "Food & Agriculture",
    apiName: "Food & Beverages",
    icon: <Leaf className="w-12 h-12" />,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: "artisan",
    displayName: "Artisan",
    apiName: "Artisan",
    icon: <Building2 className="w-12 h-12" />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    id: "realestate",
    displayName: "Real Estate",
    apiName: "Real Estate",
    icon: <Home className="w-12 h-12" />,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    id: "pets",
    displayName: "Animals & Pets",
    apiName: "Animals & Pets",
    icon: <PawPrint className="w-12 h-12" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "beverages",
    displayName: "Beverages",
    apiName: "Food & Beverages",
    icon: <Wine className="w-12 h-12" />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

interface CategoryGridProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryGrid({ selectedCategory, onCategoryChange }: CategoryGridProps) {
  const router = useRouter()

  const getCategorySlug = (id: string): string => {
    const slugMap: Record<string, string> = {
      "home-garden": "home-garden",
      vehicles: "vehicles",
      phones: "phones-tablets",
      electronics: "electronics-computers",
      furniture: "furniture",
      fashion: "fashion",
      jobs: "jobs",
      services: "services",
      health: "health-beauty",
      babies: "babies-children",
      construction: "construction-repair",
      food: "food-agriculture",
      artisan: "artisan",
      realestate: "real-estate",
      pets: "animals-pets",
      beverages: "beverages",
    }
    return slugMap[id] || id
  }

  const handleCategoryClick = (category: Category) => {
    if (category.isVendorLink) {
      router.push("/vendor-registration")
    } else {
      const slug = getCategorySlug(category.id)
      router.push(`/category/${slug}`)
    }
  }

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground text-balance mb-8">Browse Categories</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {CATEGORIES.map((category) => (
            <div key={category.id} onClick={() => handleCategoryClick(category)}>
              <Card
                className={`${category.bgColor} border-none cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden`}
              >
                <div className="p-2 sm:p-3 md:p-4 flex flex-col items-center justify-center text-center h-full min-h-[100px] sm:min-h-[120px] md:min-h-[140px]">
                  <div className={`${category.color} mb-2 sm:mb-3 transition-transform group-hover:scale-110`}>
                    {category.icon && React.isValidElement(category.icon)
                      ? React.cloneElement(category.icon as React.ReactElement<any>, {
                          className: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
                        })
                      : category.icon}
                  </div>

                  <h3
                    className={`text-xs sm:text-sm md:text-base font-semibold transition-colors text-pretty line-clamp-2 text-muted-foreground group-hover:text-foreground`}
                  >
                    {category.displayName}
                  </h3>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
