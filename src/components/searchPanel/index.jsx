"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import FoundUser from "../foundUser";
import { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";

const SearchPanel = ({ isVisible, onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

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
    <div
      className={`fixed top-0 left-0 h-full w-full max-w-sm bg-black text-white  transition-transform transform ${
        isVisible ? "translate-x-24" : "-translate-x-full"
      } duration-500 z-50`}
    >
      y
      <div className="flex justify-between items-center p-6">
        <h2 className="text-xl font-semibold">Search</h2>
        <button onClick={onClose}>
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 w-full">
        <div className="mt-6 flex items-center w-full px-3 py-1 rounded-md bg-gray-500">
          <input
            type="text"
            placeholder="search"
            className="focus:outline-none flex-1 bg-transparent"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
          />
          <button className="h-fit bg-white rounded-full">
            <XMarkIcon className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
      <div className="w-full h-[1px] bg-gray-600 my-5"></div>
      <div className="flex justify-center">
        <FadeLoader
          className="text-center text-white"
          color="#fff"
          width={5}
          loading={loading}
        />
      </div>
      {debouncedValue && !loading && users.length === 0 && (
        <p className="ml-6">User not found</p>
      )}
      {!loading &&
        users.length > 0 &&
        users.map((user) => (
          <FoundUser
            key={user.id}
            username={user.username}
            bio={user.bio}
            profilePictureUrl={user.profilePictureUrl}
          />
        ))}
    </div>
  );
};

export default SearchPanel;
