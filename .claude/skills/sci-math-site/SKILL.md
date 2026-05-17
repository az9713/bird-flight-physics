---
name: sci-math-site
description: >
  Builds scientific and mathematical education web pages and sites — the deliverable is always
  a web page with rigorous LaTeX derivations in MDX, an interactive 3D React Three Fiber
  simulation, and live parameter sliders, assembled on a Next.js 16 + MDX + KaTeX + R3F stack.
  Use this skill when the user wants to BUILD a page or site covering a physics or math topic:
  double pendulum, orbital mechanics, fluid dynamics, quantum mechanics, wave functions,
  electromagnetism, thermodynamics, Fourier analysis, special relativity, chaos theory, or
  any topic where they want rigorous equations AND a 3D interactive simulation together.
  Also triggers when adding a new module to an existing Next.js science site.
  SKIP for: pure debugging requests, Python/notebook deliverables, plain-English explanations
  without building anything, generic Next.js setup without science content, non-educational
  3D scenes (product configurators, dashboards), or non-Next.js stacks (Astro, Vue, etc.).
---

# Scientific & Mathematical Education Site

This skill guides you through building a complete scientific education module:
rigorous derivations with LaTeX equations embedded in MDX, an interactive 3D
React Three Fiber simulation, and live parameter sliders + physics readout panels.

## Reference files (read as needed)

- `references/stack-setup.md` — Next.js 16 config, dependencies, Turbopack gotchas, file layout
- `references/r3f-patterns.md` — R3F component templates, ArrowHelper, instanced particles, demo wrapper pattern
- `references/content-structure.md` — MDX derivation structure, LaTeX patterns, section ordering

---

## Phase 0: Understand the Topic

Before writing a single line of code, build a clear picture of what you're about to create.
Ask the user (or infer from context) the following:

1. **Topic**: What physical or mathematical system? (e.g., double pendulum, hydrogen atom, orbital mechanics)
2. **Scope**: How many sections / how deep? (12–20 sections is the target range)
3. **Key equations**: What are the 3–5 most important equations? What dimensionless groups govern the physics?
4. **Visualization concept**: What should move in 3D? What should the user be able to vary with sliders?
5. **Project status**: New project, or adding a module to an existing Next.js site?

If the user is vague, propose a scope and ask for confirmation before starting.

---

## Phase 1: Plan the Derivation + Simulation

Write a brief plan (not code yet):

**Derivation outline**: List 12–20 section titles following the pattern in `references/content-structure.md`:
- Start with governing equations / physical law
- Nondimensional numbers
- Core kinematic/geometric setup
- Progressive physics layers (quasi-steady → unsteady → nonlinear)
- Reduced-order model (what the demo actually computes)
- Final boxed result + synthesis

**Simulation plan**:
- What geometry/meshes appear in the scene? (bodies, surfaces, fields)
- What quantities are animated? (position, rotation, color, arrow length)
- What are the 4–6 slider parameters? What are their ranges?
- What does the live readout show? (nondimensional numbers, forces, energies, frequencies)

**Export the `computePhysics` function signature** — the pure math function that both the animation loop and the readout panel call:
```
computePhysics(param1, param2, ..., t) → { quantity1, quantity2, ... }
```

Show this plan to the user before proceeding. A clear plan prevents expensive rewrites.

---

## Phase 2: Stack Setup (if new project)

If this is a new project, read `references/stack-setup.md` in full before writing any code.

Run in order:
```bash
npx create-next-app@latest <project-name> --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
cd <project-name>
npm install @next/mdx @mdx-js/loader @mdx-js/react remark-math rehype-katex katex @react-three/fiber @react-three/drei three clsx
npm install --save-dev @types/three
```

Then write (using the exact patterns from `references/stack-setup.md`):
1. `next.config.ts` — Turbopack-compatible string plugin names
2. `mdx-components.tsx` — No-args `useMDXComponents()` API, component registry
3. `src/app/layout.tsx` — KaTeX CSS import, nav, dark theme
4. `src/app/page.tsx` — Landing page with module cards

Critical: verify the build passes before writing content:
```bash
npm run build
```

If it fails, the most common causes are in `references/stack-setup.md` (Turbopack plugin format, `ssr: false` in server components).

---

## Phase 3: Build the Visualization

Read `references/r3f-patterns.md` for concrete templates. Follow this order:

### 3a. `computePhysics()` first

Write the pure physics function before building any 3D geometry. Test it mentally:
does it return sensible values at t=0? At the parameter defaults? At edge cases?

Export it from the main simulation file so `PhysicsReadout` can use the same types.

### 3b. Build the Scene

Use the component structure from `references/r3f-patterns.md`:
- All visualization files must have `"use client"` at the top
- Use `useRef` + `useFrame` for animation — never `useState` inside `useFrame`
- Use `useMemo` for geometry that doesn't change every frame
- Use `THREE.ArrowHelper` via `useMemo` + `primitive` for force/field arrows
- Use `instancedMesh` for 50+ identical particles

### 3c. Wrap with Demo, Sliders, Readout

Compose `MySimulationDemo.tsx` following the exact wrapper pattern from `references/r3f-patterns.md`.

### 3d. Create the Lazy Wrapper

```tsx
// MySimulationLazy.tsx
"use client";
import dynamic from "next/dynamic";

const Lazy = dynamic(() => import("./MySimulationDemo"), {
  ssr: false,
  loading: () => <div className="h-[420px] flex items-center justify-center text-slate-500 text-sm">Loading 3D simulation…</div>,
});
export default Lazy;
```

Register this in `mdx-components.tsx` under a memorable component name (e.g., `PendulumDemo`, `OrbitalDemo`).

---

## Phase 4: Write the MDX Content

Read `references/content-structure.md`. The structure matters:

1. **Title + tagline** (one sentence: what it explains and why it's non-obvious)
2. **`<YourDemo />`** — the interactive simulation comes first
3. **`---`** separator
4. **Sections 1–N** following the derivation outline from Phase 1

For each section:
- Physical intuition first (1–2 sentences), then the equations
- Annotate every symbol after each significant equation
- Connect at least once to the demo sliders / readout
- End with a boxed synthesis equation + paragraph

LaTeX syntax:
- Inline: `$\alpha_{\text{eff}}$`
- Display block: `$$\nabla \cdot \mathbf{u} = 0$$`
- Boxed result: `$$\boxed{\mathbf{F} \approx -d\mathbf{I}/dt}$$`

---

## Phase 5: Verify

```bash
npm run build   # must pass — catches LaTeX escaping errors and TS errors
npm run dev     # open localhost:3000
```

Check in the browser:
- [ ] Demo loads (may take 2–3s for 3D to hydrate)
- [ ] Sliders update the scene in real-time
- [ ] Live readout shows numbers (not "Initializing…" forever)
- [ ] KaTeX equations render (not raw `$...$` text)
- [ ] No console errors

---

## Quality Bar

A complete module should have:
- **12–20 sections** with full derivations (not just equation dumps)
- **Physical intuition before every equation set**
- **4–6 slider parameters** with physically meaningful ranges
- **5–8 live readout quantities** (nondimensional numbers, forces, energies)
- **Force/field arrows** that update in real-time
- **Zero console errors** in the browser
- **Clean `npm run build`**

The gold standard: a reader who knows the physics but not the equations can use the demo to develop intuition, then read the derivation to understand why.

---

## Common Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Build fails: "loader does not have serializable options" | Using imported remark/rehype modules instead of strings | `references/stack-setup.md` → Turbopack section |
| Build fails: "`ssr: false` not allowed in Server Component" | `dynamic()` called in `mdx-components.tsx` | Create a `*Lazy.tsx` client wrapper |
| `useMDXComponents` type error | Old two-arg API | Change to `useMDXComponents(): MDXComponents` (no args) |
| Demo stuck on "Initializing…" | `onPhysics` callback causing too many re-renders | Wrap callback in `useCallback` in Demo wrapper |
| Equations render as raw text | Missing KaTeX CSS import or wrong plugin config | Check `layout.tsx` import + `next.config.ts` |
| Wings/meshes don't animate | Setting React state inside `useFrame` | Use `ref.current.position.y = ...` instead |
