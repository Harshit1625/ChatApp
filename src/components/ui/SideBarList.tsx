"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ToastComponent from "../ToastComponent";

interface SideBarListProps {
  friendList: RUser[];
  sessionID: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}


const SideBarList: FC<SideBarListProps> = ({ friendList, sessionID }) => {
  const pathname = usePathname();
  const [unseenMsg, setUnseenMsg] = useState<Message[]>([]);
  

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionID}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionID}:friends`));

    const newFriendHandler = async (sender : RUser) => {
      setTimeout(() => {
        toast.custom((t) => {
          return (
            <div className="bg-white rounded-2xl flex align-center justify-center p-3 shadow ">
              <span className="font-semibold text-indigo-600">
                {sender.name}
                </span>
                <span className="ml-2">
                  accepted your friend request !!
                </span>
            </div>
          )
        })
        location.reload();
      } , 5000)
      
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionID, message.senderId)}`;
      if (!shouldNotify) return;
      toast.custom((t) => (
        <ToastComponent
          sessionId={sessionID}
          senderId={message.senderId}
          t={t}
          senderImg={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));

      setUnseenMsg((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionID}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionID}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [sessionID]);

  

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMsg((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friendList.map((friend) => {
        const unseenMsgCount = unseenMsg.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionID,
                friend.id
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md text-sm leading-9 font-semibold"
            >
              <Image
                src={friend.image}
                alt="user"
                width={15}
                height={15}
                className="rounded-full"
              />
              {friend.name}
              {unseenMsgCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMsgCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SideBarList;
