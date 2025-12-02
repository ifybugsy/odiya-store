import Image from "next/image"

export default function SponsorsSection() {
  const sponsors = [
    { name: "TechCorp", logo: "/images.png" },
    { name: "ShopNow", logo: "/ecommerce-logo.png" },
    { name: "FastPay", logo: "/generic-payment-logo.png" },
    { name: "LogisticsPro", logo: "/logistics-logo.jpg" },
    { name: "BrandCo", logo: "/generic-brand-logo.png" },
  ]

  return (
    <section className="bg-muted/30 border-y border-border py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">Trusted By</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={sponsor.logo || "/placeholder.svg"}
                alt={sponsor.name}
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
