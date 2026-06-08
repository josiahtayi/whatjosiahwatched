import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 180,
                    height: 180,
                    background: "#0f0f0f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    position: "relative",
                }}
            >
                {/* Red top bar accent */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: "#dc2626",
                    }}
                />

                {/* Main letter */}
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 700,
                        color: "#ffffff",
                        lineHeight: 1,
                        letterSpacing: "-4px",
                    }}
                >
                    W
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 13,
                        color: "#dc2626",
                        letterSpacing: "4px",
                        marginTop: 4,
                    }}
                >
                    WATCHED
                </div>

                {/* Red bottom bar accent */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: "#dc2626",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
