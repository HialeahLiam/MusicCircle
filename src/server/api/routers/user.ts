import { z } from "zod";
import { env } from "~/env.mjs";
import { clerkClient } from "@clerk/nextjs/server";
import retry from "retry";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PagingTrackObject } from "spotify.api";
import { prisma } from "~/server/db";

async function fetchSpotifyWithUserToken({
  url,
  token,
  body,
  userId,
}: {
  url: string;
  token: string;
  body?: string;
  // App id, not Spotify id
  userId: string;
}) {
  const fetcher = async (token: string) => {
    return fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
      body,
    });
  };
  try {
    const response = await fetcher(token);
    const {} = await response.text();
    if (response.status === 401) {
      console.log(
        "❓ Spotify token might be expired. Retrieving token from Clerk and retrying API call."
      );

      const refreshedToken = await refreshSpotifyToken(userId);
      return fetcher(refreshedToken);
    }

    return response;
  } catch (error) {
    console.log({ error });
  }
}

async function refreshSpotifyToken(userId: string) {
  const [tokenResponse] = await clerkClient.users.getUserOauthAccessToken(
    userId,
    "oauth_spotify"
  );

  if (!tokenResponse)
    throw new Error("❌ Spotify token couldn't be retrieved from Clerk");

  const { token } = tokenResponse;

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      spotifyToken: token,
    },
  });

  console.log(`Spotify token retrieved from Clerk: `, { token });

  return token;
}

export const userRouter = createTRPCRouter({
  favoritesHistory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        spotifyToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userId, spotifyToken } = input;

      const favorites = await prisma.favoritesHistory.findMany({
        where: {
          userId,
        },
        orderBy: {
          dateRecorded: "desc",
        },
      });

      // if user has no favorites, they are a new user
      if (favorites.length === 0) {
        // get top tracks from spotify
        const spotifyResult = await fetchSpotifyWithUserToken({
          url: "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
          token: spotifyToken,
          // token: "234234",
          userId,
        });

        console.log({ spotifyResult });
      }
    }),

  /**
   * Procedure doesn't really refresh the token, it just asks Clerk for an up to date one.
   * If it's expired, Clerk automatically refreshes it for us.
   * We expect to call this endpoint when Spotify returns invalid token errors or on sign up to
   * attach token to Clerk User object
   */
  refreshSpotifyToken: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId } = input;

      await refreshSpotifyToken(userId);

      // we make it public instead of unsafe because we only expect to set the token in the backend
    }),
});
