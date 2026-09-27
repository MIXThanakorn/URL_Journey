import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "URL Journey — Network Observatory",
  description: "See what happens after you press Enter with an interactive browser and network simulation.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
