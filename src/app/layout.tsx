import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpic/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trikon AI",
  description: "Build extraordinary applications with AI-powered tools",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png", 
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const disableClerk = process.env.NEXT_PUBLIC_DISABLE_CLERK === 'true';

  const app = (
    <TRPCReactProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </TRPCReactProvider>
  );

  if (disableClerk) {
    return app;
  }

  return (
    <ClerkProvider appearance={{
      variables: {
        colorPrimary: "#C96342"
      }
    }}>
      {app}
    </ClerkProvider>
  );
}
