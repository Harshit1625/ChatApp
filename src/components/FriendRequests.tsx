"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus2, X } from "lucide-react";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingRequests[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  
  const [friendRequests, setRequests] = useState<IncomingRequests[]>(
    incomingFriendRequests
  );

  //pusher doesnt allow colons so we are using this fn declared in utils:pusher.ts

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`users:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
      senderName,
    }: IncomingRequests) => {
      setRequests((prev) => [
        ...prev,
        {
          senderId,
          senderEmail,
          senderName,
        },
      ]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`users:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  async function reloader() {
    return location.reload();
  }

  const acceptfriend = async (senderId: string) => {
    await axios.post("/api/requests/accept", { id: senderId });

    setRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    await reloader();
  };

  const denyfriend = async (senderId: string) => {
    await axios.post("/api/requests/deny", { id: senderId });

    setRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    await reloader();
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here !!</p>
      ) : (
        friendRequests.map((request) => {
          return (
            <div key={request.senderId} className="flex gap-4 items-center">
              <UserPlus2 className="text-black" />
              <p className="font-medium text-lg">{request.senderName}</p>
              <p className="font-medium text-lg">{request.senderEmail}</p>
              <button
                onClick={() => acceptfriend(request.senderId)}
                aria-label="accept-friend"
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md1"
              >
                <Check className="font-semibold text-white w-3/4 h-3/4" />
              </button>
              <button
                onClick={() => denyfriend(request.senderId)}
                aria-label="deny-friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <X className="font-semibold text-white w-3/4 h-3/4 " />
              </button>
            </div>
          );
        })
      )}
    </>
  );
};

export default FriendRequests;
