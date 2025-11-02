import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>

          <Card className="p-8 space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By using Odiya Store, you agree to these terms and conditions. If you do not agree, please do not use
                our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">2. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account information. You agree to accept
                responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate information</li>
                <li>Comply with all applicable laws</li>
                <li>Respect intellectual property rights</li>
                <li>Not engage in illegal or fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold">4. Seller Obligations</h2>
              <p className="text-muted-foreground">Sellers must:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate item descriptions</li>
                <li>Pay ₦500 upload fee per item</li>
                <li>Deliver items as described</li>
                <li>Respond to buyer inquiries professionally</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Odiya Store is provided "as is". We are not responsible for any losses or damages arising from your use
                of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">6. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                In case of disputes, both parties agree to communicate through the platform. If unresolved, the matter
                may be escalated to our admin team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the platform signifies your
                acceptance of updated terms.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
