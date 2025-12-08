"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { UserControl } from "@/components/user-control"
import { useScroll } from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"

export const Navbar = () => {
  const isScrolled = useScroll()
  const pathname = usePathname()

  // ✅ YOUR ORIGINAL LINKS (UNCHANGED)
  const links = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "FAQ", path: "/faq" },
  ]

  return (
    <motion.nav
      initial={{ opacity: 1, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-200 border-b border-transparent",
        isScrolled && "bg-white/5 backdrop-blur-xl border-white/10"

      )}
    >
      <div className="max-w-7xl mx-auto flex items-center">

        {/* LEFT (Logo) */}
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-3">
           <Image
  src="/logo.png"
  alt="Vibe Logo"
  width={120}
  height={36}
  className="object-contain"
/>

           
          </Link>
        </div>

        {/* CENTER (Glassmorphic Menu) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div
            className="
              flex items-center gap-10 px-10 py-3
              bg-white/5 border border-white/10 backdrop-blur-xl
              rounded-2xl
              shadow-[0_0_6px_rgba(0,255,255,0.25),0_0_10px_rgba(168,85,247,0.25)]
            "
          >
            {links.map(({ name, path }) => {
              // treat root path specially, otherwise allow prefix matches
              const active =
                path === "/" ? pathname === "/" : pathname?.startsWith(path);

              return (
                <div key={path} className="relative">
                  <Link
                    href={path}
                    className={cn(
                      "text-sm transition",
                      active ? "text-blue-400" : "text-white/70 hover:text-white"
                    )}
                  >
                    {name}
                  </Link>

                  {active && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-1 bg-blue-400 rounded-full"
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT (Auth Buttons / User Control) */}
        <div className="flex items-center justify-end flex-1 gap-3">
          <SignedOut>
            <SignInButton>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600 text-white border-0">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserControl showName />
          </SignedIn>
        </div>

      </div>
    </motion.nav>
  )
}
