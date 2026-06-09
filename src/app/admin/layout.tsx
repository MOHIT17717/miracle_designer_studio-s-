import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Miracles Designer Studio",
  description: "Manage products, orders, bookings, and offers for Miracles Designer Studio.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin pages render WITHOUT the public Navbar, Footer, LiveBackground, WhatsApp button.
  // They get their own self-contained UI with a sidebar.
  return <>{children}</>;
}
