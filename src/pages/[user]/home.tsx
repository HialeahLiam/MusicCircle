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
  console.log("HOME");
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  //   console.log({ tracks });
  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-10 h-20">hello</div>
      <div className="grid h-screen grid-cols-4 overflow-hidden">
        <div className="flex flex-col justify-center ">
          <Link href="">My favorites</Link>
          <Link href="">My Friends</Link>
        </div>

        <div className="col-span-2 flex min-h-0 flex-col flex-nowrap ">
          <div className=" basis-1/4 "></div>
          <div className="basis-3/4 overflow-y-scroll overscroll-contain ">
            <PersonalFavoritesView></PersonalFavoritesView>
          </div>
        </div>
        <div className=" ">
          <p>right</p>
        </div>
      </div>
      <div className="bg-gray-300">footer</div>
    </>
  );
}

export default Home;
