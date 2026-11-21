import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Connect } from "vite";
import authHandler from "./api/sprint/auth";
import dataHandler from "./api/sprint/data";
import recordsHandler from "./api/sprint/records";
import importHandler from "./api/sprint/import";
import type { ApiRequest, ApiResponse } from "./api/_lib/http";

function sprintApiDevMiddleware() {
  return {
    name: "sprint-api-dev-middleware",
    configureServer(server: { middlewares: Connect.Server }) {
      const localEnv = loadEnv("development", process.cwd(), "");
      for (const name of ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "SPRINT_ACCESS_PIN", "SPRINT_SESSION_SECRET"]) {
        if (!process.env[name] && localEnv[name]) process.env[name] = localEnv[name];
      }
      server.middlewares.use("/api/sprint", (req, res, next) => {
        const pathName = (req.url ?? "").split("?")[0];
        const handler = pathName === "/auth" ? authHandler
          : pathName === "/data" ? dataHandler
            : pathName === "/records" ? recordsHandler
                : pathName === "/import" ? importHandler
              : null;
        if (!handler) {
          next();
          return;
        }

        void (async () => {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const rawBody = Buffer.concat(chunks).toString("utf8");
            let body: unknown;
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch {
                res.statusCode = 400;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ error: "Request body must be valid JSON." }));
                return;
              }
            }
            const responseAdapter: ApiResponse = {
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(value) {
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify(value));
              },
              setHeader(name, value) {
                res.setHeader(name, value);
              },
              end() {
                res.end();
              },
            };
            await handler({
              method: req.method,
              headers: req.headers,
              socket: req.socket,
              body,
            } as ApiRequest, responseAdapter);
          } catch (error) {
            console.error("[sprint:dev-api]", error);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "The tracker could not complete this request. Please retry." }));
            }
          }
        })();
      });
    },
  };
}

const rawPort = process.env.PORT ?? "4173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), sprintApiDevMiddleware()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
