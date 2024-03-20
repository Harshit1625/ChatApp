"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FriendRequestsSideBarOptionsProps {
  sessionId: string | undefined;
  initialCount: number;
}

interface ISender {
  senderId: string;
  senderEmail: string;
  senderName: string;
}

const FriendRequestsSideBarOptions: FC<FriendRequestsSideBarOptionsProps> = ({
  sessionId,
  initialCount,
}) => {
  console.log(sessionId);
  const [unseenRequestsCount, setunseenRequestsCount] =
    useState<number>(initialCount);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`users:${sessionId}:incoming_friend_requests`)
    ); 

    const friendRequestHandler = (data: ISender) => {
      const { senderEmail, senderName } = data;
      console.log(senderEmail);
      setTimeout(() => {
        toast.custom((t) => {
          return (
            <Link href={'/dashboard/requests'} className="bg-white rounded-2xl flex align-center justify-center p-4 shadow ">
              <span className="font-semibold text-indigo-600">
                {senderName}
              </span>
              <span className="ml-2">sent you a friend request !!</span>
            </Link>
          );
        });
      }, 10000);
      setunseenRequestsCount((prev) => prev + 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`users:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  },[]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Check Incoming Requests</p>
     
    </Link>
  );
};

export default FriendRequestsSideBarOptions;
