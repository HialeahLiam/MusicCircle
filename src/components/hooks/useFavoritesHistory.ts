import React, { useEffect, useState } from "react";
import useAuthorizedSpotifyFetch from "./useAuthorizedSpotifyFetch";
import { type TrackObject } from "spotify.api";

/** Spotify tracks endpoint accepts up to 50 track ids */
const TRACK_LIMIT = 50;
function useFavoritesHistory() {
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [tracks, setTracks] = useState<TrackObject[]>([]);
  const [tempTracks, setTempTracks] = useState<TrackObject[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, isSuccess, isLoading, setUrl } = useAuthorizedSpotifyFetch();
  const [page, setPage] = useState(1);
  const [pageFetched, setPageFetched] = useState(false);

  useEffect(() => {
    const currentTrackPosition = TRACK_LIMIT * page;

    if (currentTrackPosition < trackIds.length) {
      const endpoint =
        currentTrackPosition + TRACK_LIMIT > trackIds.length
          ? trackIds.length
          : currentTrackPosition + TRACK_LIMIT;

      const slicedIds = trackIds.slice(currentTrackPosition, endpoint);
      setUrl(
        `https://api.spotify.com/v1/tracks?${new URLSearchParams({
          ids: slicedIds.join(","),
        }).toString()}`
      );

      setPageFetched(true);
    } else {
      setTracks(tempTracks);
      setTempTracks([]);
    }
  }, [page]);

  useEffect(() => {
    if (pageFetched && isSuccess) {
      setTempTracks((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setPageFetched(false);
    }
  }, [pageFetched, isSuccess]);

  useEffect(() => {
    if (trackIds.length) setPage(0);
  }, [trackIds]);

  return {
    setTrackIds,
    tracks,
    trackIds,
  };
}

export default useFavoritesHistory;
