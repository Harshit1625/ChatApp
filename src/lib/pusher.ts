import { getPossibleInstrumentationHookFilenames } from "next/dist/build/utils";
import PusherServer from "pusher";
import PusherClient from "pusher-js";

//pusher is used for realtime data transfer bidirectionally using websockets under the hood
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: "ap2",
  }
);
