import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Skien Svømmeklubb – Trenerregistrering",
  description: "Registrer deg som trener eller frivillig i Skien Svømmeklubb",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className="antialiased min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
