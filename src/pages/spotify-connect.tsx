import { useRouter } from "next/router";
import React from "react";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

function SpotifyConnect() {
  const router = useRouter();

  const { code, error } = router.query;

  console.log({ code });

  const tokenQuery = api.spotify.loginWithCode.useQuery(
    {
      code: code as string,
    },
    {
      enabled: !!code,
    }
  );

  if (error) {
    console.log(error);
    router.push("/").catch((err) => console.log(err));
  }

  if (tokenQuery.isError) {
    console.log("ERROR");
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="mx-auto my-48 text-2xl text-slate-500 md:text-4xl">
        Connecting to Spotify ...
      </h1>
    </div>
  );
}

export default SpotifyConnect;
