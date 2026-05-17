# Stack Setup Reference: Next.js 16 + MDX + KaTeX + R3F

## Scaffold

```bash
npx create-next-app@latest <project-name> \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-git
```

## Dependencies

```bash
# MDX pipeline
npm install @next/mdx @mdx-js/loader @mdx-js/react

# Math rendering
npm install remark-math rehype-katex katex

# 3D (React Three Fiber)
npm install @react-three/fiber @react-three/drei three
npm install --save-dev @types/three

# Utilities
npm install clsx
```

---

## next.config.ts — Critical Turbopack Rules

**Next.js 16 uses Turbopack by default.** Turbopack cannot serialize JavaScript functions (closures) as loader options. The fix: pass plugin names as **strings**, not imported modules.

```ts
// next.config.ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// ✅ CORRECT — strings work with Turbopack
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-math"],
    rehypePlugins: ["rehype-katex"],
  },
});

// ❌ WRONG — imported functions break Turbopack
// import remarkMath from "remark-math";
// remarkPlugins: [remarkMath]  ← fails with serialization error

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export default withMDX(nextConfig);
```

---

## mdx-components.tsx — Next.js 16 API Change

The signature changed: `useMDXComponents()` takes **no arguments** in Next.js 16.

```tsx
// mdx-components.tsx (at project root)
import type { MDXComponents } from "mdx/types";
import YourVisualization from "@/components/visualizations/YourVisualizationLazy";

const components: MDXComponents = {
  h1: ({ children }) => <h1 className="text-3xl font-bold mt-10 mb-4 text-sky-200">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-3 text-sky-300 border-b border-sky-900 pb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-200">{children}</h3>,
  p:  ({ children }) => <p className="my-3 text-slate-300 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside my-3 space-y-1 text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside my-3 space-y-1 text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="ml-4">{children}</li>,
  code: ({ children }) => <code className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
  pre: ({ children }) => <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 my-4 overflow-x-auto text-sm">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-sky-600 pl-4 my-4 text-slate-400 italic">{children}</blockquote>,
  hr: () => <hr className="border-slate-700 my-8" />,
  YourVisualization,           // ← each visualization component goes here
};

// ✅ CORRECT — no args in Next.js 16
export function useMDXComponents(): MDXComponents {
  return components;
}

// ❌ WRONG — old API that no longer works
// export function useMDXComponents(components: MDXComponents): MDXComponents { ... }
```

---

## Client Component Lazy Wrapper — Required for 3D

`dynamic({ ssr: false })` cannot be called in a Server Component. `mdx-components.tsx` is a server component. The fix: create a thin client wrapper.

```tsx
// src/components/visualizations/MySimulationLazy.tsx
"use client";
import dynamic from "next/dynamic";

const MySimulationLazy = dynamic(
  () => import("./MySimulation"),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 rounded-2xl border border-slate-700 bg-slate-950 h-[420px] flex items-center justify-center text-slate-500 text-sm">
        Loading 3D simulation…
      </div>
    ),
  }
);

export default MySimulationLazy;
```

Then in `mdx-components.tsx`:
```tsx
import MySimulationLazy from "@/components/visualizations/MySimulationLazy";
// Use MySimulationLazy as the component — NOT dynamic() directly
```

---

## KaTeX CSS — Global Import

In `src/app/layout.tsx`, import KaTeX CSS **before** other styles:

```tsx
import "katex/dist/katex.min.css";
```

---

## Global Layout Template

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Site Title",
  description: "Your description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#05070a] text-slate-200 min-h-screen flex flex-col">
        <header className="border-b border-slate-800 bg-black/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Site Title
            </Link>
            {/* nav links */}
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</main>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          Built with Next.js · MDX · React Three Fiber · KaTeX
        </footer>
      </body>
    </html>
  );
}
```

---

## File Layout

```
project/
├── next.config.ts                         ← MDX + Turbopack string plugins
├── mdx-components.tsx                     ← Global MDX component registry (no args API)
├── src/
│   ├── app/
│   │   ├── layout.tsx                     ← KaTeX CSS import, nav
│   │   ├── page.tsx                       ← Landing/home
│   │   └── <topic>/
│   │       └── page.mdx                   ← Full derivation with embedded demo
│   └── components/
│       └── visualizations/
│           ├── MySimulation.tsx           ← R3F scene ("use client")
│           ├── MySimulationLazy.tsx       ← dynamic({ ssr: false }) wrapper ("use client")
│           ├── MySimulationDemo.tsx       ← Combined: canvas + sliders + readout ("use client")
│           ├── ParameterExplorer.tsx      ← Slider panel ("use client")
│           └── PhysicsReadout.tsx         ← Live numbers ("use client")
```

---

## Build Verification

```bash
npm run build    # must pass with 0 errors
npm run dev      # dev server at localhost:3000
```

All visualization components **must** have `"use client"` at the top. The MDX page itself is a Server Component — only the dynamic lazy wrapper bridges the gap.
