const BASE = "";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

export const api = {
  get: async <T>(path: string) => handle<T>(await fetch(`${BASE}${path}`)),
  postJson: async <T>(path: string, body: unknown) =>
    handle<T>(
      await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    ),
  upload: async <T>(path: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return handle<T>(
      await fetch(`${BASE}${path}`, { method: "POST", body: fd }),
    );
  },
  downloadUrl(path: string) {
    return `${BASE}${path}`;
  },
};
