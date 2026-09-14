"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScanLine, Users, FileText, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "./actions"
import { useState } from "react"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Scan QR", href: "/scan", icon: ScanLine },
    { name: "Rekap Data", href: "/rekap", icon: FileText },
    { name: "Data Siswa", href: "/students", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Image src="/logo smanet.jpeg" alt="Logo" width={32} height={32} className="bg-white rounded-full p-0.5" />
          <span className="font-bold">Portal Guru</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-white border-r md:min-h-screen z-10
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b">
          <Image src="/logo smanet.jpeg" alt="Logo" width={40} height={40} className="object-contain" />
          <span className="font-bold text-lg text-primary">SMAN 7</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <span className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <Icon className="w-5 h-5" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
