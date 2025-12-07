"use client";

import { HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import SearchHistory from "../searchHistory";
import Link from "next/link";

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Delay the state reset to allow time for click events in SearchHistory
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 100); // Adjust the delay if needed
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    if (!debouncedValue) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: debouncedValue }),
        });
        const data = await res.json();
        console.log({ data });
        setUsers(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedValue]);

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
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            />
          </div>
          <Link href="/message">
            <HeartIcon className="w-6 h-6" />
          </Link>

          {/* Render SearchHistory below the input when focused */}
          <SearchHistory
            isVisible={isSearchFocused}
            users={users}
            loading={loading}
            userNotFound={debouncedValue && users.length < 1}
          />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
