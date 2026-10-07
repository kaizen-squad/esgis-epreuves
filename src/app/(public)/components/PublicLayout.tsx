import React from "react";
import Navbar from "./navbar/Navbar";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default PublicLayout;
