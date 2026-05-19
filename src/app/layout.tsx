import type { Metadata } from "next";
import "@primer/react-brand/lib/css/main.css";
import "@primer/react-brand/fonts/fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://panel-learn.dev"),
  title: {
    default: "Panel — Learn to Code",
    template: "%s | Panel",
  },
  description:
    "Interactive programming courses with hands-on coding exercises. Learn Python, Go, and more — step by step, right in your browser.",
  keywords: ["learn python", "python tutorial", "interactive coding", "learn programming", "go tutorial"],
  authors: [{ name: "Panel" }],
  openGraph: {
    type: "website",
    siteName: "Panel",
    title: "Panel — Learn to Code",
    description:
      "Interactive programming courses with hands-on coding exercises. Learn Python and Go step by step, right in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panel — Learn to Code",
    description:
      "Interactive programming courses with hands-on coding exercises.",
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
