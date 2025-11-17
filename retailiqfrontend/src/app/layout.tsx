// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export const metadata = {
  title: "RetailIQ",
  description: "Smart retail analytics and management platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0c0c0bf5] text-gray-900 flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-grow p-0 m-0">{children}</main>
        <Footer />
      </body>

    </html>
  );
}
