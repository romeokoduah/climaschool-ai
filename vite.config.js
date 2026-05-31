import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves under /climaschool-ai/; Vercel serves at the domain root.
  // Vercel sets VERCEL=1 during its build, so we pick the right base automatically.
  base: process.env.VERCEL ? "/" : "/climaschool-ai/",
  server: { port: 5173, host: true, open: false }
});
