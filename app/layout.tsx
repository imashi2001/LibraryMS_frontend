import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Management System",
  description: "Library Management System Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
