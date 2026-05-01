// lib/api.ts
const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${BACKEND}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}