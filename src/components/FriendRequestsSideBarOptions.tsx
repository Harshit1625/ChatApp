"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useState, useEffect } from "react";

interface FriendRequestsSideBarOptionsProps {
  sessionId: string | undefined;
  initialCount: number;
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

    const friendRequestHandler = () => {
      setunseenRequestsCount((prev) => prev + 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`users:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Incoming Requests</p>
      {unseenRequestsCount > 0 ? (
        <div className="rounded-full w-5 h-5 test-xs flex justify-center items-center bg-indigo-600 text-white">
          {unseenRequestsCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestsSideBarOptions;
