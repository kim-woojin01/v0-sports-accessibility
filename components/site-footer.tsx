import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">국민체육진흥공단</h3>
          <p className="text-sm text-muted-foreground">
            Wits seamlessly connects your members with the community, resources.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">How it Works</Link>
            </li>
            <li>
              <Link href="#">Checkout</Link>
            </li>
            <li>
              <Link href="#">Fraud</Link>
            </li>
            <li>
              <Link href="#">Protection</Link>
            </li>
            <li>
              <Link href="#">Payments</Link>
            </li>
            <li>
              <Link href="#">Accounts</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Learn</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">Resources</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
            <li>
              <Link href="#">FAQs</Link>
            </li>
            <li>
              <Link href="#">ThinkShop</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">About</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">Careers</Link>
            </li>
            <li>
              <Link href="#">Team</Link>
            </li>
            <li>
              <Link href="#">Partners</Link>
            </li>
            <li>
              <Link href="#">Contact Us</Link>
            </li>
            <li>
              <Link href="#">News & Press</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center">
        <div className="w-full h-12 gradient-primary flex items-center justify-center text-white text-sm">
          © Copyright ar-shakir. All right reserved
        </div>
      </div>
    </footer>
  )
}
