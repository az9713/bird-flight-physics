import type { MDXComponents } from "mdx/types";
import FlappingWingDemo from "@/components/visualizations/FlappingWingDemoLazy";
import WakeTopologyDemo from "@/components/visualizations/WakeTopologyDemoLazy";
import SpanwiseCirculationDemo from "@/components/visualizations/SpanwiseCirculationDemoLazy";
import AeroelasticWingDemo from "@/components/visualizations/AeroelasticWingDemoLazy";
import StrouhalExplorerDemo from "@/components/visualizations/StrouhalExplorerDemoLazy";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-10 mb-4 text-sky-200">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mt-8 mb-3 text-sky-300 border-b border-sky-900 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-slate-300 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside my-3 space-y-1 text-slate-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-3 space-y-1 text-slate-300">{children}</ol>
  ),
  li: ({ children }) => <li className="ml-4">{children}</li>,
  code: ({ children }) => (
    <code className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 my-4 overflow-x-auto text-sm">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-sky-600 pl-4 my-4 text-slate-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-slate-700 my-8" />,
  FlappingWingDemo,
  WakeTopologyDemo,
  SpanwiseCirculationDemo,
  AeroelasticWingDemo,
  StrouhalExplorerDemo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
