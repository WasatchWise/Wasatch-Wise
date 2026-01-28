import React from "react";

export function Callout({
  title,
  children
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className="mt-2 text-sm leading-6 text-zinc-800">{children}</div>
    </div>
  );
}

