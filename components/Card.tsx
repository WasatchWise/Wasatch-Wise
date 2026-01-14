import React from "react";

export function Card({
  title,
  subtitle,
  bullets,
  premium = false
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  premium?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 ${
      premium 
        ? "border-blue-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200" 
        : "border-zinc-200 bg-white"
    }`}>
      <h3 className={`text-base font-semibold ${premium ? "text-blue-600" : ""}`}>{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-800">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-3">
            <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${premium ? "bg-blue-500" : "bg-zinc-900"}`} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

