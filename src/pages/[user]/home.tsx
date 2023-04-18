import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { type TrackObject } from "spotify.api";
import useFavoritesHistory from "~/components/hooks/useFavoritesHistory";
import { api } from "~/utils/api";

function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  //   const [spotifyTracks, setSpotifyTracks] = useState([] as TrackObject[]);
  const { setTrackIds, tracks } = useFavoritesHistory();
  const favoritesQuery = api.user.favoritesHistory.useInfiniteQuery(
    {
      spotifyToken: user?.publicMetadata.spotifyToken as string,
      userId: user?.id as string,
    },
    {
      enabled: !!user,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );

  useEffect(() => {
    if (favoritesQuery.data) {
      const { pages } = favoritesQuery.data;
      const trackIds: string[] = [];
      pages.forEach((page) => {
        trackIds.push(...page.tracks.map((track) => track.trackId));
      });

      console.log({ trackIds });
      setTrackIds(trackIds);
      // const newTracks = lastPage ? lastPage : [] as TrackObject[]
    }
  }, [favoritesQuery.data?.pages]);

  console.log({ tracks });
  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  return (
    <div className="flex flex-col items-center py-16">
      <button onClick={() => favoritesQuery.fetchNextPage()}>click</button>
      <h2 className="mb-12">hello {paramUser}</h2>
      <div className=" h-32 w-72  rounded-lg bg-slate-700 p-4">
        <div className="flex animate-pulse items-center">
          <div className="aspect-square w-24  rounded-2xl bg-slate-500"></div>
          <div className="ml-3 flex flex-1  flex-col items-stretch gap-4">
            <div className="h-6 rounded-full   bg-slate-500"></div>
            <div className="h-6 rounded-full bg-slate-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
