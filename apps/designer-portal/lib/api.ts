const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface DesignerCreate {
  name: string;
  style: string;
  email: string;
  bio?: string;
  portfolio_url?: string;
}

export interface DesignerUpdate {
  name?: string;
  style?: string;
  email?: string;
  bio?: string;
  portfolio_url?: string;
}

export interface DesignerResponse {
  id: string;
  name: string;
  style: string;
  email: string;
  bio?: string;
  portfolio_url?: string;
}

export async function fetchDesigners(): Promise<DesignerResponse[]> {
  const res = await fetch(`${API_BASE}/designers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch designers");
  return res.json();
}

export async function getDesigner(id: string): Promise<DesignerResponse> {
  const res = await fetch(`${API_BASE}/designers/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Designer not found");
  return res.json();
}

export async function createDesigner(
  payload: DesignerCreate
): Promise<DesignerResponse> {
  const res = await fetch(`${API_BASE}/designers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create designer");
  return res.json();
}

export async function updateDesigner(
  id: string,
  payload: DesignerUpdate
): Promise<DesignerResponse> {
  const res = await fetch(`${API_BASE}/designers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update designer");
  return res.json();
}

export async function deleteDesigner(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/designers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete designer");
}
