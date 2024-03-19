import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Message, messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessage(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:message`,
      0,
      -1
    );

    console.log("results", results);

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedMessages = dbMessages.reverse();
    const messages = messageArrayValidator.parse(reversedMessages);

    return messages;
  } catch (error) {
    console.log(error);
    notFound();
  }
}

const page: FC<pageProps> = async ({ params }) => {
  const { chatId } = params;
  console.log(chatId);
  const session = await getServerSession(authOptions);
  console.log(session);

  if (!session) notFound();

  const { user } = session;
  const [userid1, userid2] = chatId.split("--");

  if (user.sub !== userid1 && user.sub !== userid2) {
    notFound();
  }

  const chatPartnerId = user.sub === userid1 ? userid2 : userid1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as RUser;

  const initialMessages = await getChatMessage(chatId);

  return (
    <>
      <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
          <div className="relative flex items-center space-x-4">
            <div className="relative">
              <div className="relative w-8 sm:w-12 h-8 sm:h-12 ml-3">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src={chatPartner.image}
                  alt={`${chatPartner.name} profile picture`}
                  className="rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <div className="text-xl flex items-center">
                <span className="text-gray-700 mr-3 font-semibold">
                  {chatPartner.name}
                </span>
              </div>

              <span className="text-sm text-gray-600">{chatPartner.email}</span>
            </div>
          </div>
        </div>

        <Messages
          sessionId={session.user.sub}
          initialMessages={initialMessages}
          sessionImg={session.user.image}
          chatPartner={chatPartner}
          chatId={chatId}
        />
        <ChatInput chatId={chatId} chatPartner={chatPartner} />
      </div>
    </>
  );
};

export default page;
