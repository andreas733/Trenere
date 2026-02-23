import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skien Svømmeklubb – Trenerregistrering",
  description: "Registrer deg som trener eller frivillig i Skien Svømmeklubb",
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
