import JSZip from 'jszip';

export interface NextJSProjectTemplate {
  [path: string]: string;
}

/**
 * Generate a Supabase client initialization utility
 * This helper is injected into generated apps that need database access
 */
export function createSupabaseInitializationScript(): string {
  return `'use client';

import { useEffect, useState } from 'react';

interface SupabaseCredentials {
  apiUrl: string;
  anonKey: string;
  projectRef: string;
}

export function useSupabaseCredentials() {
  const [credentials, setCredentials] = useState<SupabaseCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await fetch('/api/integrations/supabase/credentials');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Supabase credentials');
        }

        const data: SupabaseCredentials = await response.json();
        setCredentials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCredentials();
  }, []);

  return { credentials, loading, error };
}

/**
 * Execute a database query via the server proxy
 */
export async function queryDatabase(
  operation: 'query' | 'insert' | 'update' | 'delete',
  table: string,
  options?: {
    select?: string[];
    data?: Record<string, unknown>;
    filters?: Record<string, unknown>;
    limit?: number;
    offset?: number;
  }
) {
  const body: Record<string, unknown> = {
    operation,
    table,
    ...options,
  };

  const response = await fetch('/api/integrations/supabase/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Database query failed');
  }

  const result = await response.json();
  return result.data;
}
`;
}

// Complete Next.js project template structure
export function createNextJSProjectTemplate(generatedFiles: Record<string, string>, projectName: string): NextJSProjectTemplate {
  const template: NextJSProjectTemplate = {
    // Root configuration files
    'package.json': JSON.stringify({
      "name": projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "next": "15.3.3",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "typescript": "^5.0.0",
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0",
        "@radix-ui/react-slot": "^1.0.2",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.0.0",
        "tailwind-merge": "^2.0.0",
        "lucide-react": "^0.400.0"
      },
      "devDependencies": {
        "eslint": "^8.0.0",
        "eslint-config-next": "15.3.3"
      }
    }, null, 2),

    'next.config.ts': `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;`,

    'tsconfig.json': JSON.stringify({
      "compilerOptions": {
        "target": "ES2017",
        "lib": ["dom", "dom.iterable", "ES6"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [
          {
            "name": "next"
          }
        ],
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      "exclude": ["node_modules"]
    }, null, 2),

    'next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.`,

    'tailwind.config.ts': `import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config`,

    'postcss.config.mjs': `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config`,

    '.eslintrc.json': JSON.stringify({
      "extends": "next/core-web-vitals"
    }, null, 2),

    '.gitignore': `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`,

    'README.md': `# ${projectName}

This is a [Next.js](https://nextjs.org/) project generated with Vibe.

## 🗄️ Database Setup (Optional)

If you connected a Supabase project in Vibe, your credentials are already configured in your environment.

### Using the Database

Import the utilities from \`src/lib/supabase-utils.ts\`:

\`\`\`typescript
import { queryDatabase } from '@/lib/supabase-utils';

// Fetch data
const users = await queryDatabase('query', 'users', { select: '*' });

// Insert data
const newUser = await queryDatabase('insert', 'users', {
  data: { name: 'John', email: 'john@example.com' },
  returning: 'id, name, email'
});

// Update data
await queryDatabase('update', 'users', {
  data: { name: 'Jane' },
  filters: { id: 123 }
});

// Delete data
await queryDatabase('delete', 'users', {
  filters: { id: 123 }
});
\`\`\`

## 🚀 Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Supabase Documentation](https://supabase.com/docs)`,

    // Basic components/ui utilities
    'src/lib/utils.ts': `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,

    // Supabase utilities (if database is connected)
    'src/lib/supabase-utils.ts': `// Supabase utilities for client-side operations
// This file helps your app connect to Supabase database

// Fetch credentials from your Vibe backend
export async function useSupabaseCredentials() {
  const response = await fetch('/api/integrations/supabase/credentials');
  if (!response.ok) {
    throw new Error('Failed to fetch Supabase credentials');
  }
  const data = await response.json();
  return {
    url: data.apiUrl,
    anonKey: data.anonKey,
    projectRef: data.projectRef,
  };
}

// Execute a database query via the Vibe proxy
export async function queryDatabase(
  operation: 'query' | 'insert' | 'update' | 'delete',
  table: string,
  {
    select,
    filters,
    data,
    returning,
  }: {
    select?: string;
    filters?: Record<string, any>;
    data?: Record<string, any>;
    returning?: string;
  } = {}
) {
  const response = await fetch('/api/integrations/supabase/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      table,
      select,
      filters,
      data,
      returning,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`Database query failed: \${error.error || 'Unknown error'}\`);
  }

  return response.json();
}

// Example: Fetch all users from a table
// const users = await queryDatabase('query', 'users', { select: '*' });

// Example: Insert a new record
// const newUser = await queryDatabase('insert', 'users', {
//   data: { name: 'John', email: 'john@example.com' },
//   returning: 'id, name, email'
// });

// Example: Update a record
// await queryDatabase('update', 'users', {
//   data: { name: 'Jane' },
//   filters: { id: 123 }
// });

// Example: Delete a record
// await queryDatabase('delete', 'users', {
//   filters: { id: 123 }
// });`,

    // Default globals.css
    'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,

    // Default layout
    'src/app/layout.tsx': `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Generated by Vibe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,

    // Default page if none provided
    'src/app/page.tsx': generatedFiles['app/page.tsx'] || generatedFiles['src/app/page.tsx'] || `export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ${projectName}</h1>
        <p className="text-gray-600">Generated with Vibe</p>
      </div>
    </div>
  );
}`,

    // Public assets
    'public/.gitkeep': '',
  };

  // Add all generated files to the template
  Object.entries(generatedFiles).forEach(([filePath, content]) => {
    // Ensure the file path starts with src/ if it doesn't already
    let normalizedPath = filePath;
    if (!normalizedPath.startsWith('src/') && !normalizedPath.startsWith('public/')) {
      normalizedPath = `src/${filePath}`;
    }
    template[normalizedPath] = content;
  });

  return template;
}

// Create Next.js project template with Clerk authentication
export function createNextJSProjectTemplateWithClerk(
  generatedFiles: Record<string, string>,
  projectName: string
): NextJSProjectTemplate {
  const baseTemplate = createNextJSProjectTemplate(generatedFiles, projectName);

  // Add Clerk to package.json dependencies
  const packageJson = JSON.parse(baseTemplate['package.json']);
  packageJson.dependencies['@clerk/nextjs'] = '^6.0.0';
  packageJson.dependencies['@clerk/themes'] = '^2.0.0';
  baseTemplate['package.json'] = JSON.stringify(packageJson, null, 2);

  // Add environment variables template
  baseTemplate['.env.local'] = `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Get your keys from https://clerk.com/
# 1. Create a new application at https://dashboard.clerk.com/
# 2. Copy your publishable key and secret key
# 3. Replace the values above

# Supabase Database (Optional - will be auto-populated if connected)
# These are provided by Vibe when you connect a Supabase project
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

  // Add Clerk middleware
  baseTemplate['src/middleware.ts'] = `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  "/",
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};`;

  // Update layout with ClerkProvider
  baseTemplate['src/app/layout.tsx'] = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Generated by Vibe with Clerk Authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="border-b px-4 py-2">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">${projectName}</h1>
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton>
                    <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}`;

  // Add protected dashboard page
  baseTemplate['src/app/dashboard/page.tsx'] = `import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-gray-600">You are successfully authenticated with Clerk.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600">Clerk handles all user authentication and management.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Secure Routes</h2>
          <p className="text-gray-600">This page is protected and requires authentication.</p>
        </div>
      </div>
    </div>
  );
}`;

  // Add Supabase utilities (if using database)
  baseTemplate['src/lib/supabase-utils.ts'] = `// Supabase utilities for client-side operations
// This file helps your app connect to Supabase database

// Fetch credentials from your Vibe backend
export async function useSupabaseCredentials() {
  const response = await fetch('/api/integrations/supabase/credentials');
  if (!response.ok) {
    throw new Error('Failed to fetch Supabase credentials');
  }
  const data = await response.json();
  return {
    url: data.apiUrl,
    anonKey: data.anonKey,
    projectRef: data.projectRef,
  };
}

// Execute a database query via the Vibe proxy
export async function queryDatabase(
  operation: 'query' | 'insert' | 'update' | 'delete',
  table: string,
  {
    select,
    filters,
    data,
    returning,
  }: {
    select?: string;
    filters?: Record<string, any>;
    data?: Record<string, any>;
    returning?: string;
  } = {}
) {
  const response = await fetch('/api/integrations/supabase/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      table,
      select,
      filters,
      data,
      returning,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`Database query failed: \${error.error || 'Unknown error'}\`);
  }

  return response.json();
}

// Example: Fetch all users from a table
// const users = await queryDatabase('query', 'users', { select: '*' });

// Example: Insert a new record
// const newUser = await queryDatabase('insert', 'users', {
//   data: { name: 'John', email: 'john@example.com' },
//   returning: 'id, name, email'
// });

// Example: Update a record
// await queryDatabase('update', 'users', {
//   data: { name: 'Jane' },
//   filters: { id: 123 }
// });

// Example: Delete a record
// await queryDatabase('delete', 'users', {
//   filters: { id: 123 }
// });`;

  // Add sign-in page
  baseTemplate['src/app/sign-in/[[...sign-in]]/page.tsx'] = `import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn />
    </div>
  );
}`;

  // Add sign-up page
  baseTemplate['src/app/sign-up/[[...sign-up]]/page.tsx'] = `import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
}`;

  // Update the main page to include auth features
  baseTemplate['src/app/page.tsx'] = `import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to ${projectName}</h1>
        <p className="text-gray-600 mb-8">A Next.js app with Clerk authentication, generated by Vibe</p>
        
        <SignedOut>
          <div className="space-y-4">
            <p className="text-lg">Get started by signing up or signing in</p>
            <div className="flex gap-4 justify-center">
              <SignUpButton>
                <button className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800">
                  Sign Up
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="px-6 py-3 border rounded-md hover:bg-gray-50">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="space-y-4">
            <p className="text-lg">Welcome back! You're successfully authenticated.</p>
            <Link 
              href="/dashboard"
              className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Go to Dashboard
            </Link>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}`;

  // Add README with Clerk setup instructions
  baseTemplate['README.md'] = `# ${projectName}

This is a [Next.js](https://nextjs.org/) project with [Clerk](https://clerk.com/) authentication, generated with Vibe.

## 🔐 Authentication Setup

This project includes Clerk authentication pre-configured. To get started:

### 1. Create a Clerk Account
1. Go to [clerk.com](https://clerk.com/) and sign up
2. Create a new application

### 2. Get Your API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy your **Publishable Key** and **Secret Key**

### 3. Update Environment Variables
1. Open \`.env.local\` in your project root
2. Replace the placeholder values with your actual Clerk keys:

\`\`\`bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_actual_publishable_key
CLERK_SECRET_KEY=your_actual_secret_key
\`\`\`

## �️ Database Setup (Optional)

If you connected a Supabase project in Vibe, your credentials are already configured. The \`.env.local\` file will be auto-populated with:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Using the Database

Import the utilities from \`src/lib/supabase-utils.ts\`:

\`\`\`typescript
import { queryDatabase } from '@/lib/supabase-utils';

// Fetch data
const users = await queryDatabase('query', 'users', { select: '*' });

// Insert data
const newUser = await queryDatabase('insert', 'users', {
  data: { name: 'John', email: 'john@example.com' },
  returning: 'id, name, email'
});

// Update data
await queryDatabase('update', 'users', {
  data: { name: 'Jane' },
  filters: { id: 123 }
});

// Delete data
await queryDatabase('delete', 'users', {
  filters: { id: 123 }
});
\`\`\`

## 🚀 Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- \`/\` - Public homepage with sign-in/sign-up buttons
- \`/dashboard\` - Protected route (requires authentication)
- \`/sign-in\` - Clerk sign-in page
- \`/sign-up\` - Clerk sign-up page
- \`src/lib/supabase-utils.ts\` - Database utilities for querying

## 🔒 Authentication Features

- ✅ Sign up / Sign in / Sign out
- ✅ Protected routes
- ✅ User management
- ✅ Session management
- ✅ Email verification
- ✅ Password reset
- ✅ Social logins (configurable in Clerk dashboard)

## 🗄️ Database Features

- ✅ Query existing tables
- ✅ Insert new records
- ✅ Update records
- ✅ Delete records
- ✅ Row-level security (RLS) enforced

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Documentation](https://supabase.com/docs)`;

  return baseTemplate;
}

export async function downloadProjectAsZip(
  files: Record<string, string>,
  projectName: string,
  includeClerk: boolean = false
): Promise<void> {
  try {
    const zip = new JSZip();
    const projectTemplate = includeClerk 
      ? createNextJSProjectTemplateWithClerk(files, projectName)
      : createNextJSProjectTemplate(files, projectName);

    // Add all files to the zip
    Object.entries(projectTemplate).forEach(([path, content]) => {
      zip.file(path, content);
    });

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = includeClerk ? '-with-clerk-auth' : '';
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}${suffix}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating zip file:', error);
    throw new Error('Failed to create downloadable project');
  }
}
