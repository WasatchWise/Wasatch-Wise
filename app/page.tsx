import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-zinc-500">Wasatch Wise LLC</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Systems people actually use.</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-800">
        Wasatch Wise is a durable systems studio at the intersection of human behavior, education,
        and applied technology. We design for reality: resistance, time pressure, uneven skill,
        regulatory friction, and trust.
      </p>

      <p className="mt-8 text-sm text-zinc-600">
        Private briefing:{" "}
        <Link className="underline" href="/clarion">
          /clarion
        </Link>
      </p>
    </main>
  );
}

