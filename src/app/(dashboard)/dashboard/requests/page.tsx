import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { fetchRedis } from "@/helpers/redis";
import AddFriendButton from "@/components/ui/AddFriendButton";
import FriendRequests from "@/components/FriendRequests";

interface pageProps {}

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingRequests = (await fetchRedis(
    "smembers",
    `users:${session?.user.sub}:incoming_friend_requests`
  )) as string[];

  const incomingRequestsDetails = await Promise.all(
    incomingRequests.map(async (senderId) => {
      const sender = await fetchRedis("get", `user:${senderId}`) as string
      const data = JSON.parse(sender) as User;
      console.log(data);
      return {
        senderId,
        senderEmail: data.email,
        senderName: data.name,
      };
    })
  );

  console.log(incomingRequestsDetails);
  return (
    <main className="mt-4 px-4">
      <h1 className="font-bold text-5xl mb-8">Add</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          sessionId={session.user.sub}
          incomingFriendRequests={incomingRequestsDetails}
        />
      </div>
    </main>
  );
};

export default page;
