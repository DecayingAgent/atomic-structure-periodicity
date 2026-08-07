import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const vinext = resolve("node_modules/vinext/dist/cli.js");
const result = spawnSync(process.execPath, [vinext, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status === 0) process.exit(0);

// vinext can finish its Windows static-export cleanup with a libuv assertion
// after writing a complete artifact. Treat that known post-build code as
// successful only when the expected HTML exists.
const artifact = resolve("dist/client/index.html");
if (process.platform === "win32" && result.status === 3221226505 && existsSync(artifact)) {
  console.warn("vinext completed the static export; ignoring its Windows cleanup assertion.");
  process.exit(0);
}

process.exit(result.status ?? 1);
