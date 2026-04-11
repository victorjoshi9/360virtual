import Link from "next/link";

export default function Home() {
  return (
    <main className="home-root">
      <h1>360virtual</h1>
      <p>Open the mobile-first viewer with share mode support.</p>
      <div className="home-actions">
        <Link href="/tour/demo" className="chip">Launch Full Mode</Link>
        <Link href="/tour/demo?mode=viewer" className="chip">Launch Share Mode</Link>
      </div>
    </main>
  );
}
