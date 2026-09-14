import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TestDisha",
    short_name: "TestDisha",
    description: "Discover entrance exams and opportunities after Class 12.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F7FB",
    theme_color: "#071A4D",
    icons: [{ src: "/icon.svg", sizes: "64x64", type: "image/svg+xml" }],
  };
}
