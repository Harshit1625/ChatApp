import Button from "@/components/ui/Button";
import { getFriendsByUserId } from "@/helpers/getFriends";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";
import { Message } from "@/lib/validations/message";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RecentChats from "@/components/ui/RecentChats";
import { z } from "zod";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.sub);
  console.log(friends);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.sub, friend.id)}:message`,
        -1,
        -1
      )) as string[];

      console.log(lastMessageRaw);

      if (lastMessageRaw === undefined) {
        return {
          ...friend,
          lastMessage: {
            id: friend.id,
            senderId: friend.id,
            text: "No new messages",
            timsestamp: "",
          },
        };
      } else {
        const lastMessage = JSON.parse(lastMessageRaw) as Message;
        console.log(lastMessage);
        return {
          ...friend,
          lastMessage,
        };
      }
    })
  );

  console.log(friendsWithLastMessage);
  
  return (
    <RecentChats friendsWithLastMessage={friendsWithLastMessage} session={session} />
    );
  };

export default page;
