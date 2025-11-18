import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-3">Bugsymart.shop</h3>
            <p className="text-sm opacity-80 mb-6 leading-relaxed">
              Nigeria's trusted online marketplace for buying and selling. Connect with thousands of buyers and sellers
              nationwide.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mb-6">
              <a
                href="https://web.facebook.com/profile.php?id=61583801342905"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 transition rounded-full p-2.5"
                aria-label="Facebook"              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 transition rounded-full p-2.5"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a> 
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 transition rounded-full p-2.5"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 transition rounded-full p-2.5"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-4 opacity-90">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="opacity-75 hover:opacity-100 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-75 hover:opacity-100 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="opacity-75 hover:opacity-100 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="opacity-75 hover:opacity-100 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-4 opacity-90">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="opacity-75 hover:opacity-100 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-75 hover:opacity-100 transition">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-75 hover:opacity-100 transition">
                  Feedback
                </Link>
              </li>
              <li>
                <a href="mailto:support@bugsymat.shop" className="opacity-75 hover:opacity-100 transition">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-4 opacity-90">Contact</h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                <a href="mailto:support@bugsymat.shop" className="opacity-75 hover:opacity-100 transition break-all">
                  support@bugsymat.shop
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                <a href="tel:+2348012345678" className="opacity-75 hover:opacity-100 transition">
                  +234 9160007661
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs opacity-60 text-center md:text-left">
              © {currentYear} Bugsymart All rights reserved Ifybugsy Digital Technologies Ltd. | Made for Nigerian buyers and sellers
            </p>
            <div className="flex gap-6 text-xs opacity-60">
              <Link href="/privacy" className="hover:opacity-100 transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:opacity-100 transition">
                Terms
              </Link>
              <a href="mailto:support@bugsymat.shop" className="hover:opacity-100 transition">
                Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
