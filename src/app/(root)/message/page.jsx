import ChatBox from "@/components/Message/chatBox";
import ContactBox from "@/components/Message/contactBox";
import authOptions from "@/lib/nextAuth/authOptions";
import { getServerSession } from "next-auth";

export const metadata = {
  title: "Instagram | Message",
};

const Page = async () => {
  const session = await getServerSession(authOptions);
  const loggedInUser = {
    username: session.username,
    email: session.email,
  };
  return (
    <div className="h-full w-full flex overflow-hidden">
      <ContactBox loggedInUser={loggedInUser} />
      <ChatBox />
    </div>
  );
};

export default Page;
