import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherClient, pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { AxiosError } from "axios";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { z } from "zod";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    console.log(body);

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized access !!", { status: 401 });
    }

    //verify both users are not already friends

    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.sub}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `users:${session.user.sub}:incoming_friend_requests`,
      idToAdd
    );

    console.log(hasFriendRequest);

    if (!hasFriendRequest) {
      return new Response("No friend requests", { status: 400 });
    }

    const fetchedDataSender = await fetchRedis("get", `user:${session.user.sub}`) as string;
    const sender = (await JSON.parse(fetchedDataSender)) as RUser;

    const fetchedDataFriend = await fetchRedis("get", `user:${idToAdd}`) as string;
    const friend = (await JSON.parse(fetchedDataFriend)) as RUser;

    console.log(sender);

    //notify friend that you are now a friend
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:friends`),
      "new_friend",
      sender
    );
    await pusherServer.trigger(
      toPusherKey(`user:${session.user.sub}:friends`),
      "new_friend",
      friend
    );

    await db.sadd(`user:${session.user.sub}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.sub);
    await db.srem(
      `users:${session.user.sub}:incoming_friend_requests`,
      idToAdd
    );

    console.log("has", hasFriendRequest);
    return new Response("OK");
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 402 });
    }
    return new Response("Invalid Request", { status: 400 });
  }
}
