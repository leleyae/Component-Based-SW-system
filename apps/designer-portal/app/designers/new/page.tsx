"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDesigner } from "../../../lib/api";
import { Button } from "@repo/ui-shared/Button";

export default function NewDesignerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", style: "", email: "", bio: "", portfolio_url: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createDesigner({
        name: form.name,
        style: form.style,
        email: form.email,
        bio: form.bio || undefined,
        portfolio_url: form.portfolio_url || undefined,
      });
      router.push("/designers");
    } catch {
      setError("Failed to create designer. Please check the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem" }}>
        {label}{required && " *"}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
        style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}
      />
    </div>
  );

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Add Designer</h1>
      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {field("Name", "name", "text", true)}
        {field("Style", "style", "text", true)}
        {field("Email", "email", "email", true)}
        {field("Bio", "bio")}
        {field("Portfolio URL", "portfolio_url", "url")}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Create Designer"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}
