import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIN-Q",
  description: "LIN-Q 통합 관제 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <script
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
          async
        />
      </body>
    </html>
  );
}
