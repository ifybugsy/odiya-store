import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly, such as when you create an account, list items, or contact
                us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and improve our services</li>
                <li>To process transactions</li>
                <li>To communicate with you</li>
                <li>To enforce our terms and policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold">3. Data Security</h2>
              <p className="text-muted-foreground">
                We use industry-standard security measures to protect your personal information. However, no method is
                completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">4. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We may use third-party services for payments, analytics, and communication. These services have their
                own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">5. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal information. Contact us for requests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">6. Contact Us</h2>
              <p className="text-muted-foreground">For privacy concerns, please email us at privacy@odiyastore.com</p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
