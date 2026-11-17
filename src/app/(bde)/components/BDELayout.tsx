import React from "react";
import Navbar from "@/app/(public)/components/navbar/components/Navbar";
import Footer from "@/app/(public)/components/footer/components/Footer";
import { bdeNavLinks } from "@/app/(bde)/constants/navLinks";

const BDELayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar links={bdeNavLinks} />
      <main className="flex-1 py-10">{children}</main>
      <Footer links={bdeNavLinks} />
    </div>
  );
};

export default BDELayout;
