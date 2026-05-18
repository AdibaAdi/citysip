import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CitySip — Find the best happy hours in your city, before they end",
  description:
    "CitySip helps you discover food deals, drink specials, after-work events, and rooftop spots in 15+ U.S. cities — with live deal timers and AI-powered search.",
  metadataBase: new URL("https://citysip.app"),
  openGraph: {
    title: "CitySip — Sip the city. Find the hour.",
    description:
      "Live happy hours, drink deals & after-work events in Chicago, NYC, SF, Raleigh, Sac & more.",
    type: "website"
  },
  themeColor: "#0a0a0c"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
