import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { writeFileSync, unlinkSync } from "node:fs";

globalThis.require = createRequire(import.meta.url);

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dir, "..");

// Write a temporary entry file that won't conflict with the output
const tmpEntry = path.resolve(__dir, "_entry_tmp.mjs");
writeFileSync(tmpEntry, `import app from "../artifacts/api-server/src/app.js";\nexport default app;\n`);

try {
  await esbuild({
    entryPoints: [tmpEntry],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(__dir, "handler.mjs"),
    logLevel: "info",
    external: [
      "*.node",
      "sharp", "bcrypt", "argon2", "fsevents", "re2",
      "pg-native", "bufferutil", "utf-8-validate",
      "dtrace-provider", "lightningcss", "mysql2",
      "oracledb", "mongodb-client-encryption",
      "thread-stream", "pino-worker",
    ],
    sourcemap: false,
    banner: {
      js: `import { createRequire as __crReq } from 'node:module';
import __nodePath from 'node:path';
import __nodeUrl from 'node:url';
globalThis.require = __crReq(import.meta.url);
globalThis.__filename = __nodeUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __nodePath.dirname(globalThis.__filename);
`,
    },
  });
  console.log("✅ API bundle built: api/handler.mjs");
} finally {
  try { unlinkSync(tmpEntry); } catch {}
}
