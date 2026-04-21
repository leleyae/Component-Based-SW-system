import Link from "next/link";
import { getDesigner } from "../../../lib/api";
import { Button } from "@repo/ui-shared/Button";

export default async function DesignerProfilePage({ params }: { params: { id: string } }) {
  let designer: Awaited<ReturnType<typeof getDesigner>> | null = null;

  try {
    designer = await getDesigner(params.id);
  } catch {
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "#dc2626" }}>Designer not found.</p>
        <Link href="/designers">
          <Button variant="secondary" style={{ marginTop: "1rem" }}>Back to Designers</Button>
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <Link href="/designers" style={{ color: "#6b7280", fontSize: "0.875rem" }}>← Back</Link>
      <h1 style={{ marginTop: "1rem" }}>{designer.name}</h1>
      <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>{designer.style}</p>
      <p style={{ marginTop: "0.5rem" }}>{designer.email}</p>
      {designer.bio && <p style={{ marginTop: "1rem", color: "#374151" }}>{designer.bio}</p>}
      {designer.portfolio_url && (
        <a href={designer.portfolio_url} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: "1rem", color: "#4f46e5" }}>
          View Portfolio →
        </a>
      )}
      <div style={{ marginTop: "2rem" }}>
        <Link href={`/designers/${designer.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
      </div>
    </main>
  );
}
