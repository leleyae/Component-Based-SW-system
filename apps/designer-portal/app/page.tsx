import Link from "next/link";
import { Button } from "@repo/ui-shared/Button";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Designer Portal</h1>
      <p style={{ margin: "1rem 0", color: "#6b7280" }}>
        Welcome to the Helena Beruke Designer Platform.
      </p>
      <Link href="/designers">
        <Button variant="primary">View Designers</Button>
      </Link>
    </main>
  );
}
