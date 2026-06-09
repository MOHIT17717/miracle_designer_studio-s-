import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import LiveBackground from "@/components/ui/LiveBackground";
import PageTransition from "@/components/layout/PageTransition";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Miracles Designer Studio | Luxury Bridal Wear & Couture",
  description: "Experience the pinnacle of fashion and beauty at Miracles Designer Studio. Explore premium designer sarees, bridal lehengas, accessories, and professional makeup services in Chennai.",
  keywords: ["bridal wear", "designer studio", "saree boutique", "lehengas", "makeup services", "bridal makeup", "couture", "Chennai fashion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-brand-black text-cream relative`}
      >
        <CartProvider>
          <LiveBackground />
          <Navbar />
          <main className="flex-1 pt-24 relative z-10">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CartSidebar />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
