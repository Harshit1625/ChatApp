import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidation } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request, res: Response) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidation.parse(body.email);

    console.log("get id" + emailToAdd);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response("User does not exist", { status: 400 });
    }

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.user.sub) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    //checking if the incoming request already here of the sender

    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.sub
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    //checking if the sender is already in the friend list

    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.sub}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already added this user", { status: 400 });
    }

    //valid request logic

    await pusherServer.trigger(
      toPusherKey(`users:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.sub,
        senderEmail: session.user.email,
        senderName : session.user.name
      }
    );

    db.sadd(`users:${idToAdd}:incoming_friend_requests`, session.user.sub);

    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
