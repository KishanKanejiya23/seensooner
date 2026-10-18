import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c5f57" }}>
        <svg width="120" height="86" viewBox="0 0 28 20">
          <path d="M3 0h22a3 3 0 0 1 3 3v4.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4.2a2.8 2.8 0 0 0 0-5.6V3a3 3 0 0 1 3-3Z" fill="#ffffff" />
          <path d="M19 3.5v13" stroke="#0c5f57" strokeWidth="1.4" strokeDasharray="1.6 1.9" strokeLinecap="round" />
          <path d="M6.5 10.4 9 12.8l4.6-5.3" fill="none" stroke="#f2b134" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
