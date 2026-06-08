import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // One optimized WebP is served per image; the browser scales it to fit.
  // No server-side resizing exists under `output: "export"`, so next/image
  // runs unoptimized and emits the src as-is.
  images: { unoptimized: true },
};

export default nextConfig;
