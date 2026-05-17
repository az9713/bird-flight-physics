"use client";

import dynamic from "next/dynamic";

const FlappingWingDemoLazy = dynamic(
  () => import("./FlappingWingDemo"),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 rounded-2xl border border-slate-700 bg-slate-950 h-[420px] flex items-center justify-center text-slate-500 text-sm">
        Loading 3D visualization…
      </div>
    ),
  }
);

export default FlappingWingDemoLazy;
