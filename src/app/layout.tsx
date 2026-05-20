import type { Metadata } from "next";
import "@primer/react-brand/lib/css/main.css";
import "@primer/react-brand/fonts/fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fullstackmasters.dev"),
  title: {
    default: "Fullstack Masters — Learn to Code",
    template: "%s | Fullstack Masters",
  },
  description:
    "Structured fullstack courses with interactive exercises. Learn Python, SQL, Backend, Frontend, System Design and more — step by step, right in your browser.",
  keywords: ["fullstack", "learn programming", "python tutorial", "backend engineering", "system design", "frontend interview"],
  authors: [{ name: "Fullstack Masters" }],
  openGraph: {
    type: "website",
    siteName: "Fullstack Masters",
    title: "Fullstack Masters — Learn to Code",
    description:
      "Structured fullstack courses with interactive exercises. Learn Python, SQL, Backend, Frontend, System Design and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fullstack Masters — Learn to Code",
    description:
      "Structured fullstack courses with interactive exercises.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-color-mode="dark">
      <body>{children}</body>
    </html>
  );
}
