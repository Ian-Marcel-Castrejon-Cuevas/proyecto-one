import { defineConfig } from "vite";
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

export default defineConfig({
  plugins: [react(), redirectRootPlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ["carven2.grupoasecon.com.mx", ".grupoasecon.com.mx"],
    proxy: {
      "/phishing": {
        target: "http://192.168.28.35:3002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
