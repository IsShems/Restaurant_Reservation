import React from "react";
import { GetServerSideProps } from "next";

/**
 * Type describing the table shape returned by the backend.
 */
type Table = {
  id: number | string;
  capacity: number;
  zone?: string;
  window?: boolean;
  occupied?: boolean;
};

/**
 * Home page: fetches available tables server-side and renders a simple list.
 * Using server-side fetch avoids CORS issues during development when the
 * backend runs on a different port (8081).
 */
export default function Home({ tables }: { tables: Table[] }) {
  return (
    <main style={{ padding: 20 }}>
      <h1>Restaurant Tables</h1>
      {tables.length === 0 ? (
        <div>No tables available</div>
      ) : (
        <ul>
          {tables.map((t) => (
            <li key={t.id}>
              <strong>ID:</strong> {t.id} — <strong>Capacity:</strong>{" "}
              {t.capacity} — <strong>Has Window:</strong> {String(t.window)} —{" "}
              <strong>Occupied:</strong> {String(t.occupied)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/**
 * getServerSideProps runs on the server at each request and fetches data
 * from the backend API. This keeps the frontend minimal and avoids adding
 * client-side fetching logic or CORS workarounds.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch from the /tables endpoint as requested. Using server-side fetch
    // avoids CORS during development.
    const res = await fetch("http://localhost:8081/tables");
    if (!res.ok) {
      return { props: { tables: [] } };
    }
    const tables = await res.json();
    // Normalize property for display: some backends might return `window` or
    // `hasWindow`. Map both to `window` here so rendering logic stays simple.
    const normalized = Array.isArray(tables)
      ? tables.map((t: any) => ({
          ...t,
          window: t.hasWindow ?? t.window ?? false,
        }))
      : [];
    return { props: { tables: normalized } };
  } catch (e) {
    return { props: { tables: [] } };
  }
};
