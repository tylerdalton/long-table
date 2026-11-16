import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#8f2b37" }}>
        <svg width="140" height="140" viewBox="0 0 64 64">
          <rect x="8" y="30" width="48" height="8" rx="3" fill="#d0a066" />
          <path d="M13 38v12M51 38v12" stroke="#d0a066" strokeWidth="4" strokeLinecap="round" />
          <circle cx="18" cy="23" r="5" fill="#fbe3cf" />
          <circle cx="32" cy="23" r="5" fill="#fbe3cf" />
          <circle cx="46" cy="23" r="5" fill="#fbe3cf" />
          <path d="M32 7c3 2 4 5 2 8-3-1-4-4-2-8z" fill="#f2a65a" />
        </svg>
      </div>
    ),
    size,
  );
}
