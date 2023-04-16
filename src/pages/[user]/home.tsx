import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  api.user.favoritesHistory.useQuery(
    {
      spotifyToken: user?.publicMetadata.spotifyToken,
      userId: user?.id,
    },
    { enabled: !!user }
  );

  console.log({ userId });
  console.log({ isLoaded });

  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  console.log(router.route);
  return (
    <div className="flex flex-col items-center py-16">
      <h2 className="mb-12">hello {paramUser}</h2>
      <div className=" h-32 w-72  rounded-lg bg-slate-700 p-4">
        <div className="flex animate-pulse items-center">
          <div className="aspect-square w-24  rounded-2xl bg-slate-500"></div>
          <div className="ml-3 flex flex-1  flex-col items-stretch gap-4">
            <div className="h-6 rounded-full   bg-slate-500"></div>
            <div className="h-6 rounded-full bg-slate-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
