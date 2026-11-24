import { ImageResponse } from "next/og";
import { RopeTurkey } from "@/components/RopeTurkey";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The home-screen icon: Rope's turkey on a seed-pod cream tile. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#efe5cf" }}>
        <div style={{ width: 150, height: 150, display: "flex" }}>
          <RopeTurkey size={150} />
        </div>
      </div>
    ),
    size,
  );
}
