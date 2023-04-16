import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";
import { env } from "~/env.mjs";

function SpotifyConnectButton() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();

  const _authorizeSpotify = () => {
    const urlParams = new URLSearchParams({
      client_id: env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope:
        "user-read-currently-playing playlist-read-private playlist-modify-private user-top-read user-read-recently-played user-library-read user-read-email user-read-private",
    });
    const authUrl = `https://accounts.spotify.com/authorize?${urlParams.toString()}`;
    router.push(authUrl).catch((err) => console.log(err));
  };

  const _connectSpotify = async () => {
    return signIn
      ?.authenticateWithRedirect({
        strategy: "oauth_spotify",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/onboarding",
      })
      .catch((err) => console.log(err));
  };

  return (
    <button
      onClick={() => _connectSpotify()}
      className=" rounded-full bg-green-500 px-6 py-3 text-white hover:bg-green-400"
    >
      Connect to Spotify
    </button>
  );
}

export default SpotifyConnectButton;
