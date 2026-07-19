/**
 * Next.js server bootstrap. In sandboxed/proxied environments Node's global
 * fetch (undici) ignores HTTPS_PROXY, so server-side Supabase calls fail the
 * egress filter. When HTTPS_PROXY is present we route undici through it (with
 * the proxy CA). This is a no-op in normal hosting (Vercel sets no HTTPS_PROXY),
 * so production behavior is unchanged.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const proxyUri = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxyUri) return;
  try {
    const { setGlobalDispatcher, ProxyAgent } = await import("undici");
    const { readFileSync } = await import("node:fs");
    const caPath = process.env.NODE_EXTRA_CA_CERTS;
    const ca = caPath ? readFileSync(caPath) : undefined;
    setGlobalDispatcher(new ProxyAgent({ uri: proxyUri, requestTls: ca ? { ca } : undefined }));
  } catch {
    // undici not installed in this environment — skip; production doesn't need it.
  }
}
