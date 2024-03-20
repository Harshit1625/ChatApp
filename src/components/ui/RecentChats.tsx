"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { ChevronRight } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type AlteredMsg = {
  id: string;
  senderId: string;
  text: string;
  timsestamp: string;
};

type LastMessage = {
  lastMessage: Message;
  id: string;
  name: string;
  image: string;
  email: string;
};

type LastMesasgeAlter = {
  lastMessage: AlteredMsg;
  id: string;
  name: string;
  image: string;
  email: string;
};

interface RecentChatsProps {
  friendsWithLastMessage: (LastMessage | LastMesasgeAlter)[];
  session: Session;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const RecentChats: FC<RecentChatsProps> = ({
  friendsWithLastMessage,
  session,
}) => {
  const [newMsg, setNewMsg] = useState<boolean>(false);
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${session.user.sub}:chats`));

    const msgHandler = (message: ExtendedMessage) => {
      console.log(message);
      setNewMsg(true);
    };

    pusherClient.bind("new_message", msgHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${session.user.sub}:chats`));
      pusherClient.bind("new_message", msgHandler);
    };
  }, [session.user.sub]);
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>

            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.sub,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  {newMsg ? (
                    <span className="text-red-500 font-semibold">
                      +New Message Received
                    </span>
                  ) : (
                    <span>
                      {friend.lastMessage.senderId === session.user.sub
                        ? "You: "
                        : ""}
                      {friend.lastMessage.text}
                    </span>
                  )}
                </p>
              </div>
            </a>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentChats;
