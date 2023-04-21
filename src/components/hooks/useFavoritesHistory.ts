import React, { useEffect, useMemo, useState } from "react";
import useAuthorizedSpotifyFetch from "./useAuthorizedSpotifyFetch";
import { type TrackObject } from "spotify.api";
import { type FavoritesHistory } from "@prisma/client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

type PersonalFavorite = {
  spotifyData: TrackObject;
} & FavoritesHistory;
/** Spotify tracks endpoint accepts up to 50 track ids */
const TRACK_LIMIT = 50;
function useFavoritesHistory() {
  const { user } = useUser();
  const [favoritesHistoryItems, setFavoritesHistoryItems] = useState<
    FavoritesHistory[]
  >([]);
  const refreshMutation = api.user.refreshSpotifyToken.useMutation();

  const trackIdBatches = useMemo(() => {
    const batchSize = TRACK_LIMIT;
    const batches: string[][] = [];
    for (let i = 0; i < favoritesHistoryItems.length; i += batchSize) {
      batches.push(
        favoritesHistoryItems
          .slice(i, i + batchSize)
          .map((item) => item.trackId)
      );
    }

    return batches;
  }, [favoritesHistoryItems]);

  const spotifyToken: string =
    refreshMutation.data?.token ||
    (user?.publicMetadata.spotifyToken as string | undefined) ||
    "liam";

  const fetcher = async (trackIds: string[], batchNumber: number) => {
    const url = `https://api.spotify.com/v1/tracks?${new URLSearchParams({
      ids: trackIds.join(","),
    }).toString()}`;

    const headers = {
      Authorization: `Bearer ${spotifyToken}`,
    };
    const response = await fetch(url, { headers });

    if (response.status === 401) {
      const newToken = await refreshMutation.mutateAsync({
        userId: user?.id as string,
      });

      // user?.publicMetadata.spotifyToken = newToken;
      throw new Error(
        "❓ Spotify token might be expired. Retrieving token from Clerk and retrying API call."
      );

      // refreshMutation.mutate({ userId: user?.id as string });
    }

    const { tracks: spotifyTracks } = (await response.json()) as {
      tracks: TrackObject[];
    };

    if (spotifyTracks.length !== trackIds.length) {
      throw new Error(
        "❌ Could not retrieve tracks for all reqested favorites"
      );
    }

    const start = batchNumber * TRACK_LIMIT;
    const end = start + TRACK_LIMIT;
    return favoritesHistoryItems.slice(start, end).map((item, i) => ({
      ...item,
      spotifyData: spotifyTracks[i] as TrackObject,
    }));
  };
  // const favsQuery = useQuery({
  //   // 🚨 I'm not sure if an array of strings is valid queryKey
  //   queryKey: [...trackIds, spotifyToken],
  //   queryFn: fetcher,
  //   enabled: !!spotifyToken && !!trackIds.length,
  //   keepPreviousData: true,
  // });
  const favsQueries = useQueries({
    queries: trackIdBatches.map((batch, i) => ({
      queryKey: [batch, spotifyToken],
      queryFn: () => fetcher(batch, i),
      enabled: !!spotifyToken && !!trackIdBatches.length,
      keepPreviousData: true,
    })),
  });

  // const [tracks, setTracks] = useState<TrackObject[]>([]);
  // const [tempTracks, setTempTracks] = useState<TrackObject[]>([]);
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const { data, isSuccess, isLoading, setUrl } = useAuthorizedSpotifyFetch();
  // const [page, setPage] = useState(1);
  // const [pageFetched, setPageFetched] = useState(false);

  // useEffect(() => {
  //   const currentTrackPosition = TRACK_LIMIT * page;

  //   if (currentTrackPosition < trackIds.length) {
  //     const endpoint =
  //       currentTrackPosition + TRACK_LIMIT > trackIds.length
  //         ? trackIds.length
  //         : currentTrackPosition + TRACK_LIMIT;

  //     const slicedIds = trackIds.slice(currentTrackPosition, endpoint);
  //     setUrl(
  //       `https://api.spotify.com/v1/tracks?${new URLSearchParams({
  //         ids: slicedIds.join(","),
  //       }).toString()}`
  //     );

  //     setPageFetched(true);
  //   } else {
  //     setTracks(tempTracks);
  //     setTempTracks([]);
  //   }
  // }, [page]);

  // useEffect(() => {
  //   if (pageFetched && isSuccess) {
  //     setTempTracks((prev) => [...prev, ...data]);
  //     setPage((prev) => prev + 1);
  //     setPageFetched(false);
  //   }
  // }, [pageFetched, isSuccess]);

  // useEffect(() => {
  //   if (trackIds.length) setPage(0);
  // }, [trackIds]);

  return {
    setFavoritesHistoryItems,
    favsQueries,
  };
}

export default useFavoritesHistory;
