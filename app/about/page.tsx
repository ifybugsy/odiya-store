import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">About Odiya Store</h1>

          <Card className="p-8 mb-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Odiya Store was born from the vision of <strong>Ifybugsy Digital Technologies Limited</strong>, a
                forward-thinking tech company dedicated to revolutionizing digital commerce in Africa. Founded by
                <strong> Ifeanyi David Onyejiaka</strong>, an accomplished Software Engineer, Odiya Store represents a
                commitment to making technology accessible and empowering small businesses to thrive in the digital
                economy.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The development of Odiya Store was motivated by a simple yet powerful observation: small business owners
                and entrepreneurs across Nigeria lacked an easy-to-use, trust-based marketplace to reach customers and
                scale their operations. Traditional platforms were either too complex, too expensive, or didn't cater to
                the unique needs of Nigerian merchants. We saw an opportunity to change this narrative.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Ifybugsy Digital Technologies Limited, our mission is to make a meaningful difference in technology
                by empowering small businesses and individuals with tools that simplify commerce, foster trust, and
                unlock economic opportunities. Through Odiya Store, we're building a Facebook-like marketplace that
                connects buyers and sellers across Nigeria, making online commerce accessible, transparent, and
                beneficial for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">What We Do</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We provide a platform where:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Sellers can list items in various categories for ₦500 per item</li>
                <li>✓ Buyers can discover products with infinite scroll browsing</li>
                <li>✓ Direct communication happens between buyers and sellers</li>
                <li>✓ Admins ensure quality and safety of the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Trust</h3>
                  <p className="text-sm text-muted-foreground">
                    We verify sellers and moderate content to ensure a safe marketplace.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Mobile-first design makes trading easy for everyone, everywhere.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear pricing, instant communication, and straightforward processes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    We're building a connected community of buyers and sellers.
                  </p>
                </div>
              </div>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
