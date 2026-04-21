import Link from "next/link";
import { fetchDesigners } from "../../lib/api";
import { Button } from "@repo/ui-shared/Button";

export default async function DesignersPage() {
  let designers: Awaited<ReturnType<typeof fetchDesigners>> = [];

  try {
    designers = await fetchDesigners();
  } catch {
    // API may not be running yet in development
  }

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Designers</h1>
        <Link href="/designers/new">
          <Button variant="primary">+ Add Designer</Button>
        </Link>
      </div>

      {designers.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No designers yet. Add one to get started.</p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {designers.map((d) => (
            <li key={d.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
              <Link href={`/designers/${d.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <strong>{d.name}</strong>
                <span style={{ marginLeft: "0.75rem", color: "#6b7280", fontSize: "0.875rem" }}>{d.style}</span>
                <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.25rem" }}>{d.email}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
