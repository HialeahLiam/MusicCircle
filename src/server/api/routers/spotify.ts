import { z } from "zod";
import { env } from "~/env.mjs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  loginWithCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { code } = input;

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        }).toString(),
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.status !== 200) {
        console.log("status text: " + response.statusText);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        console.log({ body });
        throw new Error("❌ Unable to exchange auth code for Spotify token");
      }

      //   console.log({ codeForTokenResponse });
      //   try {
      //     const codeForTokenResult = await codeForTokenResponse.json();
      //   } catch (error) {
      //     console.log({ error });
      //   }

      const result = (await response.json()) as {
        access_token: string;
        token_type: string;
        expires_in: number;
        scope: string;
      };
      console.log({ result });
      return result;
    }),
});
