import { Brain, Mail } from 'lucide-react'
import Link from 'next/link'
import { siGithub, siX } from 'simple-icons'

import { SimpleIcon } from '@/components/icons'

type FooterLink = Record<'label' | 'href', string>

export function LayoutFooter() {
  const footerLinks: Record<string, FooterLink[]> = {
    product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api-docs" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Status", href: "/status" },
    ],
  };

  const socialLinks = [
    {
      icon: <SimpleIcon height={20} icon={siGithub} width={20} />,
      href: "https://github.com",
      label: "GitHub",
    },
    {
      icon: <SimpleIcon height={18} icon={siX} width={18} />,
      href: "https://x.com",
      label: "Twitter",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:support@docsai.com",
      label: "Email",
    },
  ];
  
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Docs AI</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              AI-powered document analysis for teams. Upload, analyze, and
              collaborate on documents with your organization.
            </p>
            <div className="flex gap-4 items-center">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.label}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  href={link.href}
                  key={link.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.icon}
                </a>
              ) )}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            ©{' '}
            {new Date().getFullYear()}{' '}
            Docs AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link className="hover:text-gray-900" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-gray-900" href="/terms">
              Terms of Service
            </Link>
            <Link className="hover:text-gray-900" href="/cookies">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
