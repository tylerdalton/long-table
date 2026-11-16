import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Long Table",
    short_name: "Long Table",
    description: "Our family's holiday table",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f1e5",
    theme_color: "#f8f1e5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
