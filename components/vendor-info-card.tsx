import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

interface VendorInfoCardProps {
  storeName: string
  status: string
  followers: number
  rating: number
  totalSales: number
  vendorId: string
  storeLogo?: string
}

export default function VendorInfoCard({
  storeName,
  status,
  followers,
  rating,
  totalSales,
  vendorId,
  storeLogo,
}: VendorInfoCardProps) {
  const statusColor =
    status === "approved"
      ? "bg-primary/10 text-primary border border-primary/20"
      : status === "pending"
        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
        : "bg-red-100 text-red-800 border border-red-200"

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"

  return (
    <Card className="h-auto hover:shadow-lg transition-shadow group overflow-hidden animate-item-entrance">
      {/* Store Logo/Image Section */}
      <div className="relative w-full h-40 bg-muted overflow-hidden">
        <img
          src={storeLogo || `${appUrl}/placeholder-store.png`}
          alt={`${storeName} Store`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          width={280}
          height={160}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Store Name & Status */}
        <div className="mb-3">
          <h3 className="font-semibold text-sm line-clamp-1 text-foreground mb-2">{storeName}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${statusColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Followers</p>
            <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {followers}
            </p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {rating.toFixed(1)}
            </p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Sales</p>
            <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {totalSales}
            </p>
          </div>
        </div>

        {/* Visit Store Button */}
        <Link href={`/vendor/${vendorId}`} className="block">
          <Button className="w-full bg-primary hover:bg-primary/90 text-sm" size="sm">
            Visit Store
          </Button>
        </Link>
      </div>
    </Card>
  )
}
