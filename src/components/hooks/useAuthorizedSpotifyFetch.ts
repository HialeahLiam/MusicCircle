import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import { type TrackObject } from "spotify.api";
import { api } from "~/utils/api";

function useAuthorizedSpotifyFetch(initialUrl?: string, body?: string) {
  const { user, isLoaded } = useUser();

  /** prevents useQuery from fetching while Clerk is updating Spotify access token */
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [url, setUrl] = useState(initialUrl);

  const refreshMutation = api.user.refreshSpotifyToken.useMutation();
  const spotifyToken = user?.publicMetadata.spotifyToken;

  useEffect(() => {
    setTokenRefreshing(false);
  }, [spotifyToken]);

  const fetcher = useCallback(async () => {
    const innerFetcher = () =>
      fetch(url as string, {
        headers: {
          Authorization: `Bearer ${spotifyToken as string}`,
        },
        body,
      });
    const response = await innerFetcher();

    if (response.status === 401) {
      console.log(
        "❓ Spotify token might be expired. Retrieving token from Clerk and retrying API call."
      );

      refreshMutation.mutate({ userId: user?.id as string });
      setTokenRefreshing(true);
      return [];
    }
    const { tracks } = (await response.json()) as {
      tracks: Promise<TrackObject[]>;
    };
    return tracks;
  }, [url, spotifyToken, body, user, refreshMutation]);

  const query = useQuery({
    queryKey: [url, body, spotifyToken],
    queryFn: () => fetcher(),
    enabled: !!spotifyToken && !!url && !!user && !tokenRefreshing,
  });

  if (isLoaded && !spotifyToken) {
    console.log(
      "❌ User object did not have a spotifyToken present in publicMetadata"
    );
  }

  return { ...query, setUrl };
}

export default useAuthorizedSpotifyFetch;
