import React from "react";

export function Section({
  kicker,
  title,
  children,
  className = ""
}: {
  kicker?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-12 border-b border-zinc-100 last:border-0 ${className}`}>
      {kicker ? (
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-1">{kicker}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-6 text-lg leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

