import Link from "next/link";
import { Mail, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { StoreInfo } from "@/lib/store";

export default function StoreFooter({ store }: { store: StoreInfo }) {
  const linkColumns = [
    {
      title: "Customer Service",
      links: [
        { href: `/store/${store.slug}/account/orders`, label: "Order History" },
        { href: `/store/${store.slug}/account/addresses`, label: "Your Addresses" },
        { href: `/store/${store.slug}/cart`, label: "Your Cart" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: `/store/${store.slug}/login`, label: "Log In" },
        { href: `/store/${store.slug}/signup`, label: "Sign Up" },
      ],
    },
    {
      title: "Shop",
      links: [
        { href: `/store/${store.slug}`, label: "Home" },
        { href: `/store/${store.slug}/search`, label: "All Products" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link href={`/store/${store.slug}`} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                <ShoppingBag className="h-6 w-6 text-primary" />
                {store.name}
              </Link>
              <p className="text-muted-foreground my-4 max-w-sm">
                Thanks for shopping with us. Browse our latest products and offers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>Visit us: {store.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>Reach out via the contact form</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>Secure checkout via Razorpay</span>
                </div>
              </div>
            </div>

            {linkColumns.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
