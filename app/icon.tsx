import { ImageResponse } from "next/og";
import { RopeTurkey } from "@/components/RopeTurkey";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The favicon: Rope's turkey, simplified so it reads at tab size. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#efe5cf", borderRadius: 14 }}>
        <div style={{ width: 60, height: 60, display: "flex" }}>
          <RopeTurkey simple size={60} />
        </div>
      </div>
    ),
    size,
  );
}
