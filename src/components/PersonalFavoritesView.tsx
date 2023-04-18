import { type FavoritesHistory } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { api } from "~/utils/api";
import useFavoritesHistory from "./hooks/useFavoritesHistory";
import { useAuth, useUser } from "@clerk/nextjs";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";

const skeleton = (
  <div className="flex w-36 animate-pulse flex-col items-stretch gap-2">
    <div className=" aspect-square   rounded-xl bg-slate-500"></div>
    <div className=" h-2  rounded-full   bg-slate-500"></div>
    <div className=" h-2 rounded-full bg-slate-500"></div>
  </div>
);

const TRACK_LIMIT = 10;
function PersonalFavoritesView() {
  const { setTrackIds, tracks, trackIds } = useFavoritesHistory();
  const { user } = useUser();

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
    if (!favoritesQuery.isLoading && favoritesQuery.data) {
      return favoritesQuery.data.pages.map((page) => page.tracks).flat();
    }

    return [] as FavoritesHistory[];
  }, [favoritesQuery.data]);

  const favorites = useMemo(() => {
    return tracks
      .map((track, i) => ({
        spotifyData: track,
        ...(favoritesEntries[i] as FavoritesHistory),
      }))
      .filter((fav) => fav.spotifyData.id === fav.trackId);
  }, [favoritesEntries, tracks]);

  console.log(favoritesEntries.length, tracks.length);
  useEffect(() => {
    console.log({ trackIds });
    setTrackIds(favoritesEntries.map((fav) => fav.trackId));
  }, [favoritesQuery.data?.pages]);

  return (
    <div className="mx-auto  flex flex-wrap justify-center gap-6 ">
      {/* <InfiniteScroll
        dataLength={favorites.length}
        hasMore={!!favoritesQuery.hasNextPage}
        next={favoritesQuery.fetchNextPage}
        loader={<span>loading...</span>}
        className="mx-auto  flex flex-wrap justify-center gap-6 bg-red-300"
      > */}
      {tracks.length === 0 ? (
        <>{new Array(TRACK_LIMIT).fill(null).map((_) => skeleton)}</>
      ) : (
        favorites.map((fav) => (
          <div
            key={`${fav.trackId}${
              user?.id as string
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
        ))
      )}
      {/* </InfiniteScroll> */}
      <button onClick={() => favoritesQuery.fetchNextPage()}>more</button>

      {/* <div className=" rounded-xl bg-slate-700"> */}

      {/* </div> */}
    </div>
  );
}

export default PersonalFavoritesView;
