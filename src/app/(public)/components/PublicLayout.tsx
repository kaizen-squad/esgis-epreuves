import React from "react";
import Navbar from "../navbar/components/Navbar";
import Footer from "../footer/components/Footer";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
