import React from "react";
import SpotifyConnectButton from "../buttons/SpotifyConnectButton";

function Landing() {
  return (
    <main>
      <div className="container mx-auto my-24  px-12 font-bold  md:px-24 ">
        <h2 className=" mb-8 text-3xl text-slate-800  sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
          Know what your friends are listening to at all times
        </h2>
        <h3 className=" mb-16  text-xs text-slate-600 sm:text-sm lg:text-lg">
          Connect your Spotify and invite your friends to stay up to date on
          their music tastes.
        </h3>
        <div className="flex justify-center">
          <SpotifyConnectButton></SpotifyConnectButton>
        </div>
      </div>
    </main>
  );
}

export default Landing;
