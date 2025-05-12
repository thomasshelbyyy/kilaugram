"use client";

import { HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import SearchHistory from "../searchHistory";
import Link from "next/link";

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Delay the state reset to allow time for click events in SearchHistory
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 100); // Adjust the delay if needed
  };

  return (
    <>
      <nav className="fixed flex justify-between md:hidden top-0 left-0 w-screen px-5 py-2 border-b border-gray-400 text-white bg-black z-10">
        <button className="logo text-lg flex items-center gap-3">
          Instagram
          {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
        </button>
        <div className="flex gap-3 relative items-center">
          <div className="rounded-md bg-gray-600 flex">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-200 pl-3 pr-2" />
            <input
              type="text"
              placeholder="Search"
              className="focus:outline-none bg-transparent"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <Link href="/message">
            <HeartIcon className="w-6 h-6" />
          </Link>

          {/* Render SearchHistory below the input when focused */}
          <SearchHistory isVisible={isSearchFocused} />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
