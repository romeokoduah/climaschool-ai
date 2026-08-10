import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Three hosts, three base paths: GitHub Pages serves under /climaschool-ai/, Vercel
  // and our own Contabo vhost serve at the root. Vercel sets VERCEL=1 itself; the
  // Contabo deploy script passes SITE_BASE=/ explicitly.
  base: process.env.SITE_BASE || (process.env.VERCEL ? "/" : "/climaschool-ai/"),
  server: { port: 5173, host: true, open: false }
});
