"use client";

import { FaInstagram } from "react-icons/fa";
import { Satisfy } from "@next/font/google";
import { useState } from "react";
import {
  Bars3Icon,
  HomeIcon as HomeSolid,
  ChatBubbleLeftEllipsisIcon as ChatSolid,
  GlobeAsiaAustraliaIcon as GlobeSolid,
} from "@heroicons/react/16/solid";
import {
  HomeIcon as HomeOutline,
  ChatBubbleLeftEllipsisIcon as ChatOutline,
  GlobeAsiaAustraliaIcon as GlobeOutline,
  HeartIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoreMenu from "../moreMenu";
import SearchPanel from "../searchPanel";
import NotificationPanel from "../notificationPanel";
import CreatePost from "../createPost";
import Image from "next/image";
import noProfile from "@/assets/profile/no-profile.png";

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: ["400"],
});

const Sidebar = ({ session, loggedInUser }) => {
  const [smallNavigation, setSmallNavigation] = useState(false);
  const [isSearchPanelVisible, setSearchPanelVisible] = useState(false);
  const [notificationPanelVisible, setNotificationPanelVisible] =
    useState(false);
  const [createPostActive, setCreatePostActive] = useState(false);
  const [moreMenuActive, setMoreMenuActive] = useState(false);
  const pathname = usePathname();

  const handleSearchClicked = () => {
    setSmallNavigation((prev) => !prev);
    setSearchPanelVisible((prev) => !prev);
  };

  const handleCloseSearchPanel = () => {
    setSearchPanelVisible(false);
    setSmallNavigation(false);
  };

  const handleNotificationClicked = () => {
    setSmallNavigation((prev) => !prev);
    setNotificationPanelVisible((prev) => !prev);
  };

  const handleCloseNotificationPanel = () => {
    setNotificationPanelVisible(false);
    setSmallNavigation(false);
  };

  const handleCreateClicked = () => {
    setCreatePostActive(true);
  };

  const handleMoreClicked = () => {
    setMoreMenuActive((prev) => !prev);
  };

  return (
    <>
      <aside
        className={`fixed border-r border-gray-200 bg-black hidden md:flex flex-col gap-6 text-white p-6 items-center ${
          pathname === "/message" || smallNavigation
            ? "lg:items-center"
            : "lg:w-64 lg:items-start"
        } h-screen transition duration-1000 z-[99]`}
      >
        <Link
          className="w-full text-center flex justify-center lg:justify-start"
          href="/"
        >
          {pathname === "/message" || smallNavigation ? (
            <FaInstagram className="w-7 h-7 text-white" />
          ) : (
            <div className="flex items-center">
              {/* Tampilkan tulisan hanya di layar large, kecuali saat smallNavigation aktif */}
              <span
                className={`${
                  satisfy.className
                } hidden lg:block text-2xl logo ${
                  smallNavigation ? "hidden" : ""
                }`}
              >
                Pentagram
              </span>
            </div>
          )}
        </Link>

        <ul className="font-semibold w-full">
          <li className="w-full">
            <Link
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
              href="/"
            >
              <span>
                {pathname === "/" ? (
                  <HomeSolid className="w-7 h-7" />
                ) : (
                  <HomeOutline className="w-7 h-7" />
                )}
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Home
                </span>
              )}
            </Link>
          </li>
          <li className="w-full mt-4">
            <button
              onClick={handleSearchClicked}
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
            >
              <span>
                <MagnifyingGlassIcon className="w-7 h-7" />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Search
                </span>
              )}
            </button>
          </li>
          <li className="w-full mt-4">
            <Link
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
              href="/explore"
            >
              <span>
                {pathname === "/explore" ? (
                  <GlobeSolid className="w-7 h-7" />
                ) : (
                  <GlobeOutline className="w-7 h-7" />
                )}
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Explore
                </span>
              )}
            </Link>
          </li>
          <li className="w-full mt-4">
            <Link
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
              href="/"
            >
              <span>
                <PlayCircleIcon className="w-7 h-7" />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Reels
                </span>
              )}
            </Link>
          </li>
          <li className="w-full mt-4">
            <Link
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
              href="/message"
            >
              <span>
                {pathname === "/message" ? (
                  <ChatSolid className="w-7 h-7" />
                ) : (
                  <ChatOutline className="w-7 h-7" />
                )}
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Messages
                </span>
              )}
            </Link>
          </li>
          <li className="w-full mt-4">
            <button
              onClick={handleNotificationClicked}
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
            >
              <span>
                <HeartIcon className="w-7 h-7" />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Notifications
                </span>
              )}
            </button>
          </li>
          <li className="w-full mt-4">
            <button
              onClick={handleCreateClicked}
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
            >
              <span>
                <PlusCircleIcon className="w-7 h-7" />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Create
                </span>
              )}
            </button>
          </li>
          <li className="w-full mt-4">
            <Link
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
              href={`/${loggedInUser.username}`}
            >
              <span>
                <Image
                  width={100}
                  height={100}
                  src={loggedInUser.profilePictureUrl || noProfile}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  Profile
                </span>
              )}
            </Link>
          </li>
          <li className="w-full mt-4 relative">
            <button
              onClick={handleMoreClicked}
              className="w-full px-3 py-2 rounded-md flex gap-4 items-center hover:bg-white/30"
            >
              <span>
                <Bars3Icon className="w-7 h-7" />
              </span>
              {pathname !== "/message" && (
                <span className={`hidden ${!smallNavigation && "lg:block"}`}>
                  More
                </span>
              )}
            </button>

            {moreMenuActive && <MoreMenu />}
          </li>
        </ul>
      </aside>
      <SearchPanel
        isVisible={isSearchPanelVisible}
        onClose={handleCloseSearchPanel}
      />
      <NotificationPanel
        isVisible={notificationPanelVisible}
        onClose={handleCloseNotificationPanel}
      />
      {createPostActive && (
        <CreatePost
          setVisible={setCreatePostActive}
          loggedInUser={loggedInUser}
        />
      )}
    </>
  );
};

export default Sidebar;
