import type { NextConfig } from "next";

const pagesBuild = process.env.PAGES_BUILD === "true" || process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  // vinext's export server requests `/` during prerendering, so use an asset
  // prefix for the one-route Pages artifact. This keeps the generated HTML
  // runnable at the repository URL without making the internal render route
  // look for `/atomic-structure-periodicity/`.
  basePath: "",
  assetPrefix: pagesBuild ? "/atomic-structure-periodicity" : "",
  images: { unoptimized: true },
};

export default nextConfig;
