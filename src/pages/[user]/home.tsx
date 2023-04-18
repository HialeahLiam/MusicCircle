import { useAuth, useUser } from "@clerk/nextjs";
import { type FavoritesHistory } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type TrackObject } from "spotify.api";
import useFavoritesHistory from "~/components/hooks/useFavoritesHistory";
import { api } from "~/utils/api";

const skeleton = (
  <div className="flex animate-pulse flex-col items-stretch gap-2">
    <div className=" aspect-square  w-24 rounded-xl bg-slate-500"></div>
    <div className=" h-2  rounded-full   bg-slate-500"></div>
    <div className=" h-2 rounded-full bg-slate-500"></div>
  </div>
);

const TRACK_LIMIT = 10;

function Home() {
  console.log("HOME");
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  //   const [spotifyTracks, setSpotifyTracks] = useState([] as TrackObject[]);
  const { setTrackIds, tracks, trackIds } = useFavoritesHistory();

  const favoritesQuery = api.user.favoritesHistory.useInfiniteQuery(
    {
      spotifyToken: user?.publicMetadata.spotifyToken as string,
      userId: user?.id as string,
      limit: TRACK_LIMIT,
    },
    {
      enabled: !!user,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );

  const favoritesEntries = useMemo(() => {
    if (favoritesQuery.isSuccess) {
      return favoritesQuery.data.pages.map((page) => page.tracks).flat();
    }

    return [] as FavoritesHistory[];
  }, [favoritesQuery.data]);

  console.log(favoritesEntries.length, tracks.length);

  const favorites = useMemo(() => {
    return tracks.map((track, i) => ({
      spotifyData: track,
      ...(favoritesEntries[i] as FavoritesHistory),
    }));
  }, [favoritesEntries, tracks]);

  useEffect(() => {
    console.log({ trackIds });
    setTrackIds(favoritesEntries.map((fav) => fav.trackId));
  }, [favoritesQuery.data?.pages]);

  //   console.log({ tracks });
  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  return (
    <div className="flex flex-col items-center py-16">
      <button onClick={() => favoritesQuery.fetchNextPage()}>click</button>
      <h2 className="mb-12">hello {paramUser}</h2>
      {tracks.length === 0 ? (
        <div className="flex flex-col">
          {new Array(TRACK_LIMIT).fill(null).map((_) => skeleton)}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={favorites.length}
          hasMore={!!favoritesQuery.hasNextPage}
          next={favoritesQuery.fetchNextPage}
          loader={<span>loading...</span>}
        >
          {favorites.map((fav) => (
            <div
              key={`${fav.trackId}${
                userId as string
              }${fav.dateRecorded.toUTCString()}`}
              className="mb-4 flex w-36 flex-col items-stretch gap-2 overflow-hidden rounded-xl bg-slate-900"
            >
              <div className="relative mb-2 aspect-square  overflow-hidden ">
                <Image
                  src={fav.spotifyData.album?.images[0]?.url || ""}
                  alt="album cover"
                  fill={true}
                ></Image>
              </div>
              <div className="flex flex-col  px-4 pb-4">
                <span className="truncate text-xs text-slate-400">
                  {fav.spotifyData.artists?.map((a) => a.name).join(", ")}
                </span>
                <span className="line-clamp-2  text-white">
                  {fav.spotifyData.name}
                </span>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
      {/* <div className=" rounded-xl bg-slate-700"> */}

      {/* </div> */}
    </div>
  );
}

export default Home;
