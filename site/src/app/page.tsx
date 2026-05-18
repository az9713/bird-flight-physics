import Link from "next/link";

const SECTIONS = [
  {
    href: "/physics/wing-flapping",
    title: "Wing Flapping Physics",
    desc: "18-section rigorous derivation: Navier-Stokes, Theodorsen, vortex impulse, LEV, aeroelasticity — with interactive 3D visualization.",
    badge: "Live Demo",
  },
  {
    href: "/physics/wake-topology",
    title: "Wake Topology",
    desc: "Vortex ring shedding, impulse theorem, and the discrete ring vs. continuous ladder wake transition.",
    badge: "Live Demo",
  },
  {
    href: "#",
    title: "Strouhal Explorer",
    desc: "Interactive map of St = fA/U showing efficient flight regimes for birds, bats, fish, and insects.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "Spanwise Circulation",
    desc: "Prandtl lifting-line theory, tip vortex rollup, and optimum elliptic load distribution.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "Aeroelastic Wing",
    desc: "Fluid–structure coupling: Cauchy number, controlled compliance, and passive pitch adaptation.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "CFD Comparison",
    desc: "How reduced-order models compare to DNS and panel-method results across Re regimes.",
    badge: "Coming soon",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="py-12 text-center space-y-4">
        <h1 className="text-4xl font-bold text-sky-300">Bird Flight Physics</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Rigorous unsteady aerodynamics with interactive 3D visualizations and
          full mathematical derivations. No biology hand-waving.
        </p>
        <Link
          href="/physics/wing-flapping"
          className="inline-block mt-4 px-6 py-3 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
        >
          Start with Wing Flapping →
        </Link>
      </section>

      {/* Section grid */}
      <section>
        <h2 className="text-xl font-semibold text-slate-300 mb-6">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ href, title, desc, badge }) => (
            <Link
              key={title}
              href={href}
              className={`group block rounded-xl border border-slate-700 bg-slate-900/60 p-5 hover:border-sky-700 transition-colors ${
                href === "#" ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                  {title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    badge === "Live Demo"
                      ? "bg-sky-900 text-sky-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {badge}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stack info */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
        <h2 className="font-semibold text-slate-300 mb-2">Stack</h2>
        <p>
          <strong className="text-slate-200">Next.js 15</strong> (App Router) ·{" "}
          <strong className="text-slate-200">MDX</strong> for equation-heavy pages ·{" "}
          <strong className="text-slate-200">KaTeX</strong> for LaTeX math ·{" "}
          <strong className="text-slate-200">React Three Fiber</strong> for 3D ·{" "}
          <strong className="text-slate-200">Tailwind CSS</strong>
        </p>
      </section>
    </div>
  );
}
