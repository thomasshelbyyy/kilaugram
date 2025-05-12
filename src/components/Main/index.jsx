"use client";

import { usePathname } from "next/navigation";

const Main = ({ children }) => {
  const pathname = usePathname();
  console.log({ pathname });
  return (
    <main
      className={`h-screen md:pl-24 ${
        pathname === "/message" ? "lg:pl-24" : "lg:pl-64"
      }  bg-black text-white w-full md:pt-0`}
    >
      {children}
    </main>
  );
};

export default Main;
