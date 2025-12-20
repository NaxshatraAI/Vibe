"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { UserControl } from "@/components/user-control"

import { cn } from "@/lib/utils"

export const Navbar = () => {

  const pathname = usePathname()

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
      className="
        fixed top-0 left-0 right-0 z-50
        px-6 py-4
        bg-transparent
      "
    >
      <div className="max-w-7xl mx-auto flex items-center">

        {/* LEFT – LOGO */}
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

        {/* CENTER – GLASS NAV LINKS ONLY */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div
            className="
              flex items-center gap-10 px-10 py-3
              rounded-2xl
              border border-white/20
              backdrop-blur-xl
              bg-white/10
              shadow-[0_0_12px_rgba(168,85,247,0.25),0_0_18px_rgba(20,184,166,0.25)]
            "
          >
            {links.map(({ name, path }) => {
              const active =
                path === "/" ? pathname === "/" : pathname?.startsWith(path)

              return (
                <div key={path} className="relative">
                  <Link
                    href={path}
                    className={cn(
                      "text-sm transition-colors duration-200",
                      active
                        ? "text-violet-400"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    {name}
                  </Link>

                  {active && (
                    <motion.div
                      layoutId="underline"
                      className="
                        absolute left-1/2 -translate-x-1/2 -bottom-1
                        w-6 h-1 rounded-full
                        bg-gradient-to-r from-teal-400 to-violet-400
                      "
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT – AUTH / USER */}
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
