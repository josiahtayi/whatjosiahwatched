import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "180px",
                    height: "180px",
                    background: "#0f0f0f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background: "#dc2626",
                    }}
                />

                <div
                    style={{
                        fontSize: "100px",
                        fontWeight: 700,
                        color: "#ffffff",
                        lineHeight: 1,
                        letterSpacing: "-4px",
                    }}
                >
                    W
                </div>

                <div
                    style={{
                        fontSize: "13px",
                        color: "#dc2626",
                        letterSpacing: "4px",
                        marginTop: "4px",
                    }}
                >
                    WATCHED
                </div>

                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background: "#dc2626",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
