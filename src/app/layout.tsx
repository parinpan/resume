import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  formatDetection: {
    telephone: false,
  },
  title: "Fachrin Aulia Nasution | Senior Software Engineer | Resume",
  description:
    "Senior Software Engineer with 7+ years of experience designing large-scale distributed systems. Skilled in Go, Python, TypeScript, Kafka, PostgreSQL, Kubernetes, AWS, and gRPC. Currently at Upvest in Berlin, Germany. Previously at Choco, Delivery Hero, Gojek, and Tokopedia.",
  keywords: [
    "Fachrin Aulia Nasution",
    "Senior Software Engineer",
    "Software Engineer",
    "Backend Engineer",
    "Distributed Systems",
    "Go",
    "Golang",
    "Python",
    "TypeScript",
    "Kafka",
    "PostgreSQL",
    "Kubernetes",
    "AWS",
    "gRPC",
    "Berlin",
    "Germany",
    "Upvest",
    "Gojek",
    "Tokopedia",
    "Delivery Hero",
    "Resume",
    "CV",
  ],
  authors: [{ name: "Fachrin Aulia Nasution", url: "https://fachr.in" }],
  creator: "Fachrin Aulia Nasution",
  metadataBase: new URL("https://resume.fachr.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    title: "Fachrin Aulia Nasution | Senior Software Engineer",
    description:
      "Senior Software Engineer with 7+ years building large-scale distributed systems for millions of users. Go, Kafka, PostgreSQL, Kubernetes, AWS.",
    url: "https://resume.fachr.in",
    siteName: "Fachrin Aulia Nasution",
    locale: "en_US",
    firstName: "Fachrin",
    lastName: "Nasution",
    gender: "male",
  },
  twitter: {
    card: "summary",
    title: "Fachrin Aulia Nasution | Senior Software Engineer",
    description:
      "Senior Software Engineer with 7+ years building large-scale distributed systems. Go, Kafka, PostgreSQL, Kubernetes, AWS.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/fachrin-cartoon.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/images/fachrin-cartoon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lora.variable}>{children}</body>
    </html>
  );
}
