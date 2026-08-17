import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maros Tasks",
    short_name: "Maros Tasks",
    description: "Field task workspace for Maros Construction",
    start_url: "/tasks?view=mine",
    display: "standalone",
    background_color: "#111318",
    theme_color: "#111318",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
