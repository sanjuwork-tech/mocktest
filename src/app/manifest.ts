import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "MockStride", short_name: "MockStride", description: "Mock tests for CUET UG, IISER IAT, NISER NEST, and COMEDK.", start_url: "/", display: "standalone", background_color: "#F6F7FB", theme_color: "#071A4D", icons: [{ src: "/logo-mark.svg", sizes: "64x64", type: "image/svg+xml" }] };
}
