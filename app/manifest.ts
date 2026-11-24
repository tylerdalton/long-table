import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Long Table",
    short_name: "Long Table",
    description: "Our family's holiday table",
    start_url: "/",
    display: "standalone",
    background_color: "#f5eee2",
    theme_color: "#f5eee2",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
