import { useAuth, useUser } from "@clerk/nextjs";
import { type FavoritesHistory } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type TrackObject } from "spotify.api";
import PersonalFavoritesView from "~/components/PersonalFavoritesView";
import useFavoritesHistory from "~/components/hooks/useFavoritesHistory";
import { api } from "~/utils/api";

function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  //   console.log({ tracks });
  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  return (
    <div className="px-8">
      {/* <div className="fixed left-0 right-0 top-0 z-10 h-24  px-8 ">hello</div> */}
      <div className="flex h-screen min-h-0 flex-col ">
        <div className="mt-10 flex gap-6 border-b-2  text-xl">
          <Link href="" className="-mb-0.5 border-b-2 border-black  font-bold">
            Me
          </Link>
          <Link href="" className="-mb-0.5 ">
            Friends
          </Link>
        </div>
        <div className="grid min-h-0 grid-cols-4 pt-2 ">
          <div className=" mb-2 flex flex-col  gap-6  pr-4">
            <div className="flex items-center  ">
              <span className="text text-4xl font-light">
                {user?.externalAccounts[0]?.firstName}
              </span>
              <Image
                src={user?.externalAccounts[0]?.avatarUrl}
                width={30}
                height={30}
                className=" ml-4  aspect-square rounded-full object-cover"
              ></Image>
            </div>
          </div>

          <div className="col-span-2 h-full overflow-y-scroll overscroll-contain  pl-8">
            <div className="mb-10  border-b-2 pt-10 ">
              <span className=" text-6xl text-slate-500 ">Your favorites:</span>
            </div>
            <div className="">
              <PersonalFavoritesView></PersonalFavoritesView>
            </div>
          </div>
          <div className=" "></div>
        </div>
      </div>
    </div>
  );
}

export default Home;
