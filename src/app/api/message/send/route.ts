import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import {
  Message,
  messageArrayValidator,
  messageValidator,
} from "@/lib/validations/message";
import { ZodError } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request, res: Response) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    const session = await getServerSession(authOptions);
    console.log("session", session);

    if (!session) {
      return new Response("User not authorized", { status: 401 });
    }

    const [userId1, userId2] = chatId.split("--");

    if (session.user.sub !== userId1 && session.user.sub !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.user.sub === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.sub}:friends`
    )) as string[];

    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("This User is not your friend", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.sub}`
    )) as string;

    const sender = JSON.parse(rawSender) as User;

    const timeStamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.sub,
      text: text,
      timsestamp: timeStamp,
    };
 
    const message = messageValidator.parse(messageData);

    //fetching realtime chat data or messages

    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), "incoming_message" , message)


    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`) , "new_message" , {
      ...message,
      senderImg : sender.image,
      senderName : sender.name
    })



    await db.zadd(`chat:${chatId}:message`, {
      score: timeStamp,
      member: JSON.stringify(message),
    });

    return new Response("OK");
  } catch (error) {
    if(error instanceof ZodError){
      return new Response("Zoderror");
    }
    return new Response("error");
  }
}
