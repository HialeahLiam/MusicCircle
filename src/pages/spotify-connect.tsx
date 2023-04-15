import { useRouter } from "next/router";
import React from "react";
import { env } from "~/env.mjs";

function SpotifyConnect() {
  const router = useRouter();

  console.log(router.query);
  return (
    <div className="flex flex-col items-center">
      <h1 className="mx-auto my-48 text-2xl text-slate-500 md:text-4xl">
        Connecting to Spotify ...
      </h1>
    </div>
  );
}

export default SpotifyConnect;
