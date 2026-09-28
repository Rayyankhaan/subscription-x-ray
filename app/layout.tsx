import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://subscription-x-ray.vercel.app"),
  title: "Subscription X-Ray — see what's quietly leaving your account",
  description: "Find recurring charges in your bank or card statement. Runs entirely in your browser — nothing uploaded.",
  openGraph: {
    title: "Subscription X-Ray",
    description: "Find recurring charges in your bank or card statement — nothing uploaded, runs in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription X-Ray",
    description: "Find recurring charges in your bank or card statement.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
