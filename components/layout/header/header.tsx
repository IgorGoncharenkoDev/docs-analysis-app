import { Brain } from 'lucide-react'
import Link from 'next/link'

import { AuthSection } from '@/components/layout/header/auth-section'
import { MobileMenu } from '@/components/layout/header/mobile-menu'
import { Navbar } from '@/components/layout/header/navbar'

export function LayoutHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link className="flex items-center gap-2 font-bold text-xl" href="/">
          <Brain className="h-6 w-6 text-blue-600" />
          Docs AI
        </Link>
        <Navbar />
        <div className="flex items-center gap-4">
          <AuthSection />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
