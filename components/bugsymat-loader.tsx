import Image from "next/image"

interface BugsymatLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function BugsymatLoader({ size = "md", className = "" }: BugsymatLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Spinning orbital ring effect */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary/30 border-r-secondary/30 animate-spin`}
          style={{ animationDuration: "2s" }}
        />

        {/* Pulsing logo */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${sizeClasses[size]} animate-pulse`}
          style={{ animationDuration: "1.5s" }}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bugsymat-logo-GcN4XQ6tNy7kGG0AnuvRQdwIXZEeln.png"
            alt="Bugsymat Loading"
            width={size === "sm" ? 64 : size === "md" ? 96 : 128}
            height={size === "sm" ? 64 : size === "md" ? 96 : 128}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export function BugsymatFullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <BugsymatLoader size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
