import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const vinext = resolve("node_modules/vinext/dist/cli.js");
const result = spawnSync(process.execPath, [vinext, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (process.env.PAGES_BUILD === "true") {
  // GitHub Pages supplies the repository prefix in the public URL. Keep the
  // static files at the artifact root, then prefix only the generated HTML
  // references so `/atomic-structure-periodicity/_next/...` resolves once.
  for (const file of ["dist/client/index.html", "dist/client/404.html"]) {
    if (!existsSync(resolve(file))) continue;
    const html = readFileSync(resolve(file), "utf8").replaceAll("/_next/", "/atomic-structure-periodicity/_next/");
    writeFileSync(resolve(file), html, "utf8");
  }
}

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
