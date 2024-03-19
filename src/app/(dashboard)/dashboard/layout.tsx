import FriendRequestsSideBarOptions from "@/components/FriendRequestsSideBarOptions";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SideBarList from "@/components/ui/SideBarList";
import SignOutButton from "@/components/ui/SignOutButton";
import { getFriendsByUserId } from "@/helpers/getFriends";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { LucideProps } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export type SidebarOption = {
  id: number;
  name: string;
  href: string;
  Icon: Icon; //here icon is a type declared in components/icons
};

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus2",
  },
];

// you can also write :-
// const Layout = async ({children} : LayoutProps)=>{}

const Layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const fetchFriends = await getFriendsByUserId(session.user.sub);
  console.log(fetchFriends);

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `users:${session.user.sub}:incoming_friend_requests`
    )) as string[]
  ).length;

  console.log(unseenRequestCount);

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
       <MobileChatLayout  friends={fetchFriends} session={session} sidebarOptions={sidebarOptions} unseenRequestCount={unseenRequestCount} />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center ">
          <Icons.Logo className="h-8 w-auto text-indigo-800 rotate-180"></Icons.Logo>
        </Link>
        {fetchFriends.length > 0 ? (
          <div className="text-xs text-gray-400 font-semibold leading-6">
            Your Chats
          </div>
        ) : null}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-col flex-1 gap-y-7">
            <li>
              <SideBarList
                friendList={fetchFriends}
                sessionID={session.user.sub}
              />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>
            </li>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {sidebarOptions.map((option) => {
                const Icon = Icons[option.Icon];
                return (
                  <li key={option.id}>
                    <Link
                      href={option.href}
                      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6"
                    >
                      <span className="text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 items-center border  justify-center rounded-lg border-text-[0.625rem] font-medium">
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="truncate font-semibold">{option.name}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <FriendRequestsSideBarOptions
                  sessionId={session.user.sub}
                  initialCount={unseenRequestCount}
                />
              </li>
            </ul>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session?.user.image || ""}
                    alt="Your profile image"
                  />
                </div>

                {/* for visually impaired */}
                <span className="sr-only">Your Profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session?.user.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session?.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container py-16 md:py-12 w-full">
        {children}
      </aside>
    </div>
  );
};

export default Layout;
