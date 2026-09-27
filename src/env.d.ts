/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * URL receiving beta sign-ups as `POST { "email": "…" }` (JSON). Answers:
   * 2xx = registered, 409 = already registered, anything else = error.
   * Leave empty until the service exists: the form then says so honestly.
   */
  readonly PUBLIC_BETA_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
