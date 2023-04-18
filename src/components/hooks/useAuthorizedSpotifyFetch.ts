import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import { type TrackObject } from "spotify.api";
import { api } from "~/utils/api";

function useAuthorizedSpotifyFetch(initialUrl?: string, body?: string) {
  const { user, isLoaded } = useUser();

  /** prevents useQuery from fetching while Clerk is updating Spotify access token */
  const [url, setUrl] = useState(initialUrl);

  const refreshMutation = api.user.refreshSpotifyToken.useMutation();

  /** we retrieve the refresh token from our mutation instead of useUser hook because
   * for some reason the user object isn't reflecting the updated token
   */
  const spotifyToken =
    refreshMutation.data?.token || user?.publicMetadata.spotifyToken;

  console.log({ isLoaded });
  console.log({ spotifyToken }, { url }, { user });

  const fetcher = useCallback(async () => {
    console.log(`query fetched with url ${url} and token ${spotifyToken}`);
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
    enabled: !!spotifyToken && !!url && !!user,
  });

  console.log({ query });

  if (isLoaded && !spotifyToken) {
    console.log(
      "❌ User object did not have a spotifyToken present in publicMetadata"
    );
  }

  return { ...query, setUrl };
}

export default useAuthorizedSpotifyFetch;
