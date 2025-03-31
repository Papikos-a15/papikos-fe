"use client";

import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-full flex-grow">{children}</div>
    </div>
  );
};

export default Layout;
