import Link from "next/link";
import { Twitter, Linkedin, Video, Youtube } from "lucide-react";

const productLinks = [
  { label: "Trending Products", href: "/dashboard" },
  { label: "Pre-Viral Detection", href: "/dashboard/pre-viral" },
  { label: "Ad Intelligence", href: "/dashboard/ads" },
  { label: "Creator Discovery", href: "/dashboard/creators" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
];

const useCaseLinks = [
  { label: "For Dropshippers", href: "/for-dropshippers" },
  { label: "For Resellers", href: "/for-resellers" },
  { label: "For Agencies", href: "/for-agencies" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Compare vs FastMoss", href: "/comparison/vs-fastmoss" },
  { label: "Compare vs JungleScout", href: "/comparison/vs-junglescout" },
  { label: "Compare vs Triple Whale", href: "/comparison/vs-triple-whale" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Video, href: "https://tiktok.com", label: "TikTok" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MarketingFooter() {
  return (
    <footer className="bg-[#0A0E1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                YS
              </div>
              <span className="text-lg font-bold">YouSell</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              The intelligence layer for modern ecommerce
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2 — Product */}
          <FooterLinkColumn title="Product" links={productLinks} />

          {/* Column 3 — Use Cases */}
          <FooterLinkColumn title="Use Cases" links={useCaseLinks} />

          {/* Column 4 — Company */}
          <FooterLinkColumn title="Company" links={companyLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>&copy; 2026 yousell.online &middot; All rights reserved</span>
          <span>Built in London 🇬🇧 &middot; Powered by 25 AI engines</span>
        </div>
      </div>
    </footer>
  );
}
