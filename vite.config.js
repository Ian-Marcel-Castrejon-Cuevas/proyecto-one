import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function redirectRootPlugin() {
  return {
    name: "redirect-root",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(`Petición recibida: ${req.url}`);

        if (req.url === "/") {
          console.log("Redirigiendo / → /proyect-one");
          res.statusCode = 302;
          res.setHeader("Location", "/proyect-one");
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), redirectRootPlugin()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3002",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
