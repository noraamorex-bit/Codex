import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Physics Playground",
    short_name: "Physics Lab",
    description:
      "A hands-on particle sandbox for materials, reactions, and physics experiments.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a10",
    theme_color: "#070a10",
    orientation: "any",
    categories: ["education", "games", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
