import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/climaschool-ai/",
  server: { port: 5173, host: true, open: false }
});
