"use client";

import { FadeLoader } from "react-spinners";
import FoundUser from "../foundUser";

const SearchHistory = ({ isVisible, users, loading, userNotFound }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-12 right-4 w-80 bg-gray-700 text-white border-t border-gray-400 rounded-sm min-h-[200px]">
      {/* <div className="flex justify-between text-sm px-5 pt-5 pb-2">
				<div className="font-semibold">Recent</div>
				<button className="font-medium text-blue-500">Clear all</button>
			</div> */}
      {loading && (
        <div className="flex justify-center">
          <FadeLoader color="#fff" />
        </div>
      )}

      <div className="mx-h-[500px] overflow-y-auto">
        {users.length > 0 &&
          !loading &&
          users.map((user) => (
            <FoundUser
              bio={user.bio}
              profilePictureUrl={user.profilePictureUrl}
              username={user.username}
            />
          ))}
      </div>
      {!loading && userNotFound && (
        <p className="text-center">User not found</p>
      )}
    </div>
  );
};

export default SearchHistory;
