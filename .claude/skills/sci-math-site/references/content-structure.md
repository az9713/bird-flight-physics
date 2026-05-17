# MDX Content Structure for Scientific Derivations

## What makes a good scientific education page

The target is rigorous-but-readable: every equation should connect forward and backward to the others, the physical intuition should precede the math, and the interactive demo should sit at the top so readers can play before committing to the full derivation.

Good section count: **12–20 sections**. Fewer and it's a blog post. More and it becomes a textbook chapter that nobody reads.

---

## Page Template

```mdx
# [Topic Title]

*[One-sentence hook: what this explains and why it's non-obvious.]*

<YourVisualizationDemo />

---

## 1. Governing equations: [what physical law applies]

[Setup: define the domain, the field, the quantities. Use domain-appropriate notation.]

$$
\text{primary governing equation}
$$

[Boundary / initial conditions:]

$$
\text{BCs or ICs}
$$

[One paragraph connecting this to the physical picture.]

---

## 2. Relevant nondimensional numbers

[Why dimensionless numbers matter: they reveal the dominant physics.]

**[First number — e.g., Reynolds, Strouhal, Mach]**

$$
\text{Number} = \frac{\text{numerator}}{\text{denominator}}
$$

[Typical range for this topic and what it implies about the physics.]

[Repeat for each important number.]

---

## 3. [Core kinematic or geometric setup]

[Define the degrees of freedom. Write the parametric form of motion or shape.]

$$
x(t) = \ldots, \quad \dot{x}(t) = \ldots
$$

[Explain what each symbol means. Connect to what the sliders in the demo control.]

---

## 4–N. [Physics sections: one concept per section]

Suggested ordering:
1. Governing equations + BCs
2. Nondimensional numbers
3. Kinematics / geometry
4. Primary force/field model (quasi-static or linear)
5. Nonlinear / unsteady corrections
6. Energy or power analysis
7. Stability or resonance (if applicable)
8. Asymptotic limits / scaling laws
9. Key physical mechanisms (LEV, chaos, resonance, etc.)
10. Reduced-order model (what the demo actually computes)
11. The deepest physical picture (one boxed equation + prose)

---

## N. The deepest physical picture

[Always end with a synthesis. Box the most important equation. Explain in one paragraph what it means physically. Connect back to the demo.]

$$
\boxed{
  \text{the single most important result}
}
$$

[Paragraph: why this is the right way to think about the phenomenon. What evolution / engineering / nature has optimized.]
```

---

## LaTeX in MDX

Inline math (remark-math syntax):
```
The effective angle of attack is $\alpha_{\text{eff}} \approx \alpha - \dot{h}/U$.
```

Block (display) math:
```
$$
L'(r,t) = \tfrac{1}{2}\rho\, U_{\text{eff}}^2\, c(r)\, C_L(\alpha_{\text{eff}})
$$
```

Multi-line with alignment:
```
$$
\begin{aligned}
F_z &= L\cos\gamma - D\sin\gamma \\
F_x &= L\sin\gamma - D\cos\gamma
\end{aligned}
$$
```

Boxed result:
```
$$
\boxed{
  \mathbf{F} \approx -\frac{d\mathbf{I}}{dt}
}
$$
```

**Pitfalls:**
- Escape underscores in text: `$C\_L$` → use `$C_L$` inside `$...$` (fine), but in prose use `C_L` carefully
- Backslash commands need double-backslash in some contexts — if an equation doesn't render, check escaping
- `\text{...}` for roman/upright text inside math
- `\tfrac` for inline-sized fractions in display math

---

## Section Naming Conventions

Name sections to be searchable and informative, not just numbered:

❌ Too vague: `## 3. Equations`
✅ Good: `## 3. Wing kinematics: heaving, pitching, and effective angle of attack`

❌ Too long: `## 7. The relationship between vorticity, circulation, and the Kutta-Joukowski theorem applied to finite wings`
✅ Good: `## 7. Vorticity formulation: birds fly by sculpting vortex rings`

---

## Equation Annotation Pattern

After each significant equation, explain what every symbol means in one line:

```mdx
$$
St = \frac{fA}{U}
$$

where $f$ is the flapping frequency, $A$ is the stroke amplitude, and $U$ is the forward speed.
Efficient animals operate in $0.2 \lesssim St \lesssim 0.4$.
```

---

## Connecting Math to the Demo

At least once, explicitly tell the reader which sliders correspond to which symbols:

```mdx
The slider for **Frequency f** sets $f$ in the Strouhal number above.
Increasing it while holding $U$ constant pushes $St$ past the efficient range — watch
the readout panel to see this live.
```

---

## Physical Intuition Before Math

Each section should open with 1–2 sentences of physical intuition before showing the equations:

✅ Good:
```
A flapping wing does not merely move up and down; it continuously changes the angle
at which it meets the incoming air. The quantity that captures this is the effective
angle of attack:

$$
\alpha_{\text{eff}}(r,t) = \alpha(r,t) - \tan^{-1}\!\left(\frac{\dot{h}}{U}\right)
$$
```

❌ Avoid:
```
## 3. Wing kinematics

$$
\alpha_{\text{eff}}(r,t) = \alpha(r,t) - \tan^{-1}\!\left(\frac{\dot{h}}{U}\right)
$$

The above equation defines the effective angle of attack.
```

---

## What Belongs in the Simulation vs. the Text

**In the simulation:**
- Physically moving objects (bodies, particles, fields)
- Force/vector arrows with live magnitudes
- Parameter sliders for the 4–6 most important variables
- Live numerical readout of derived quantities (nondimensional numbers, forces, energies)

**In the text (not the simulation):**
- Full derivations with all intermediate steps
- Historical context, physical motivation
- Limiting cases, asymptotic scaling laws
- Comparison to experiment or CFD
- Stability analysis, bifurcation diagrams

---

## Checklist Before Publishing

- [ ] Every equation has all symbols explained
- [ ] Physical intuition comes before, not after, the math
- [ ] The demo is at the top (before section 1)
- [ ] Section titles are descriptive and searchable
- [ ] The final section has a boxed equation + synthesis paragraph
- [ ] All Greek letters and subscripts render correctly (`npm run build`)
- [ ] The demo sliders connect to symbols used in the derivation
