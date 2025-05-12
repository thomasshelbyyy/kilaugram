import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Conversation from "../conversation";

const ContactBox = ({ loggedInUser }) => {
  return (
    <div className="h-full lg:w-80 flex flex-col border-r border-gray-300 pb-10 md:pb-0">
      <div className="flex justify-center lg:justify-between px-6 pt-4 pb-12">
        <button className="font-semibold hidden lg:block">
          {loggedInUser.username}
        </button>
        <button>
          <PencilSquareIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
        <Conversation />
      </div>
    </div>
  );
};

export default ContactBox;
