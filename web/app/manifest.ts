import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SeenSooner",
    short_name: "SeenSooner",
    description: "Independent NHS waiting-time guide: live A&E waits and hospital waiting lists",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0c5f57",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
