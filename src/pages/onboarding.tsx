import { useAuth, useUser } from "@clerk/nextjs";
import {
  AsYouType,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "libphonenumber-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import TelephoneInput from "~/components/TelephoneInput";
import { api } from "~/utils/api";
const DEFAULT_COUNTRY = "US";
function Onboarding() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const tokenQuery = api.user.refreshSpotifyToken.useMutation();

  useEffect(() => {
    if (!!userId) tokenQuery.mutate({ userId });
  }, [userId]);

  if (isLoaded && userId && tokenQuery.isSuccess) {
    router.replace(`/${userId}/home`).catch((err) => console.log(err));
  } else if ((isLoaded && !userId) || tokenQuery.isError) {
    router.replace(`/`).catch((err) => console.log(err));
  }
  /** Not use this component for now. Only for routing after sign in. */
  return (
    <div className="container mx-auto my-24  flex flex-col items-center px-12 sm:px-36 lg:px-48">
      <h2 className="mb-24 text-center text-3xl font-bold text-slate-500 sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
        Welcome!
      </h2>
      {/* <div className=" mb-16  flex  flex-col gap-4 text-xs sm:text-sm lg:text-xl">
        <p>We see you're new around here!</p>
        <p>
          Let's get your number so we can text you updates on what your friends
          are into.
        </p>
        <div className="mx-auto">
          <TelephoneInput></TelephoneInput>
        </div>
        <button className=" text-sm text-slate-500">Maybe later</button>
      </div> */}
    </div>
  );
}

export default Onboarding;
