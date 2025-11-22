"use client"

import type React from "react"

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
} from "lucide-react"

interface Category {
  id: string
  displayName: string // Display name shown to user
  apiName: string // API category name sent to backend
  icon: React.ReactNode
  color: string
  bgColor: string
}

const CATEGORIES: Category[] = [
  {
    id: "vehicles",
    displayName: "Vehicles",
    apiName: "Cars", // Map display name to API category
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
  const handleCategoryClick = (category: Category) => {
    onCategoryChange(category.apiName)
  }

  const getSelectedCategoryDisplay = () => {
    const category = CATEGORIES.find((c) => c.apiName === selectedCategory)
    return category?.displayName || ""
  }

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-balance">Browse Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {CATEGORIES.map((category) => (
            <div key={category.id} onClick={() => handleCategoryClick(category)}>
              <Card
                className={`${category.bgColor} border-none cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden ${
                  selectedCategory === category.apiName ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-48">
                  <div className={`${category.color} mb-4 transition-transform group-hover:scale-110`}>
                    {category.icon}
                  </div>

                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors text-pretty ${
                      selectedCategory === category.apiName
                        ? "text-foreground font-bold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
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
