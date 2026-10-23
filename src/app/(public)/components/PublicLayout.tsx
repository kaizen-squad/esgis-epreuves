import React from "react";
import Navbar from "./navbar/components/Navbar";
import Footer from "./footer/components/Footer";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1 py-10">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
