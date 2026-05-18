# Bird Flight Physics

Rigorous unsteady aerodynamics of bird flight — six modules of full mathematical derivation, each with an interactive 3D simulation.

![The physics in a nutshell](nutshell.jpg)
*The entire physics chain distilled: from wing kinematics through vortex wake impulse to lift and thrust.*

[**A coherent mathematical derivation of bird wing physics →**](https://az9713.github.io/bird-flight-physics/wing_flapping_physics.html)

https://github.com/user-attachments/assets/17379472-6255-4169-aa53-cbecfa8f64fb


---

## Running the simulations

**Option 1 — Standalone (no install needed)**

Open `wing_flapping_physics.html` directly in Chrome. It contains the full theoretical treatment of bird wing flapping aerodynamics — governing equations, nondimensional analysis, vortex dynamics, Theodorsen model, aeroelasticity — alongside an interactive 3D simulation with parameter sliders and a live physics readout. No build step required.

**Option 2 — Full Next.js site**

```bash
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Six modules are available, each with a full derivation and embedded interactive 3D demo, all equations typeset in KaTeX.

---

## What's in here

| Path | Description |
|---|---|
| `site/` | Next.js 16 education site with full derivation + embedded 3D demo |
| `wing_flapping_physics.html` | Standalone HTML — complete theory, math, and 3D simulation (no install needed) |
| `.claude/skills/sci-math-site/` | Reusable Claude Code skill for this stack |

---

## The site

**Stack:** Next.js 16 · MDX · KaTeX · React Three Fiber · Tailwind CSS

**Pages:**
- `/` — landing page with module cards

| Module | Route | Sections | 3D Simulation |
|--------|-------|----------|---------------|
| Wing Flapping Physics | `/physics/wing-flapping` | 18 | Flapping wings, vortex wake, force arrows |
| Wake Topology | `/physics/wake-topology` | 14 | Animated vortex rings, thrust arrow |
| Spanwise Circulation | `/physics/spanwise-circulation` | 13 | Γ(y) bars, tip vortex spirals |
| Aeroelastic Wing | `/physics/aeroelastic-wing` | 12 | Deforming wing, flutter trigger |
| Strouhal Explorer | `/physics/strouhal-explorer` | 12 | 3D efficiency surface, species dots |
| CFD Comparison | `/physics/cfd-comparison` | 12 | Model accuracy landscape (Re × k) |

**Physics covered across all modules** (all with full LaTeX derivations):
- Unsteady Navier–Stokes, Reynolds/Strouhal/reduced-frequency numbers
- Wing kinematics, quasi-steady lift, Theodorsen model, added mass
- Vortex ring wake, Kelvin's theorem, impulse theorem **F = −dI/dt**
- Prandtl lifting-line, induced drag, elliptic load, Oswald efficiency
- Aeroelastic coupling, Cauchy number, flutter, passive pitch adaptation
- Strouhal number optimality, cross-species convergence at St ≈ 0.28
- Model hierarchy: quasi-steady → panel → RANS → DNS, applicability by Re and k

---

## The Claude Code skill

`.claude/skills/sci-math-site/` is a reusable [Claude Code](https://claude.ai/code) skill that builds sites like this one for any physics or math topic.

**It handles:**
- Full LaTeX derivation in MDX (remark-math + rehype-katex)
- React Three Fiber 3D visualization with parameter sliders and live readout
- Next.js 16 + Turbopack-specific config (string-based plugin names, no-args `useMDXComponents`, client-side lazy wrappers)

**To use it** in a new Claude Code session, just ask:
> "Build me a page about the double pendulum with Lagrangian mechanics and a 3D chaos simulation"

Claude will pick up the skill automatically and follow its workflow.

**Reference files:**
- `SKILL.md` — main workflow (5 phases: plan → scaffold → build 3D → write MDX → verify)
- `references/stack-setup.md` — exact config, dependencies, Turbopack gotchas
- `references/r3f-patterns.md` — R3F component templates, ArrowHelper, instanced particles
- `references/content-structure.md` — MDX derivation structure and LaTeX patterns

---

## Possible future modules

- Hovering flight — momentum jet, induced power, actuator disk
- Formation flight — upwash harvesting, V-formation energetics
- Morphing wing — variable geometry, gull-wing sweep optimization
