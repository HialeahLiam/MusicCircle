import { useAuth, useUser } from "@clerk/nextjs";
import { Dialog } from "@headlessui/react";
import { type FavoritesHistory } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type TrackObject } from "spotify.api";
import PersonalFavoritesView from "~/components/PersonalFavoritesView";
import useFavoritesHistory from "~/components/hooks/useFavoritesHistory";
import { api } from "~/utils/api";

function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [showNewUserModal, setShowNewUserModal] = useState(true);

  //   console.log({ tracks });
  const { user: paramUser } = router.query;
  if (isLoaded && userId !== paramUser) {
    router.replace("/").catch((err) => console.log(err));
  }

  const triggerNewUser = () => {
    console.log("NEW USER");
    setShowNewUserModal(true);
  };

  return (
    <>
      <Dialog
        open={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
      >
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel>
              <Dialog.Title>Deactivate account</Dialog.Title>
              <Dialog.Description>
                This will permanently deactivate your account
              </Dialog.Description>

              <p>
                Are you sure you want to deactivate your account? All of your
                data will be permanently removed. This action cannot be undone.
              </p>

              {/*
          You can render additional buttons to dismiss your dialog by setting
          `isOpen` to `false`.
        */}
              <button onClick={() => setShowNewUserModal(false)}>Cancel</button>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
      <div className="px-8">
        {/* <div className="fixed left-0 right-0 top-0 z-10 h-24  px-8 ">hello</div> */}
        <div className="flex h-screen min-h-0 flex-col ">
          <div className="mt-10 flex gap-6 border-b-2  text-xl">
            <Link
              href=""
              className="-mb-0.5 border-b-2 border-black  font-bold"
            >
              Me
            </Link>
            <Link href="" className="-mb-0.5 ">
              Friends
            </Link>
          </div>
          <div className="grid min-h-0 grid-cols-4 pt-2 ">
            <div className=" mb-2 flex flex-col  gap-6  pr-4">
              <div className="flex items-center  ">
                <span className="text text-4xl font-light">
                  {user?.externalAccounts[0]?.firstName}
                </span>
                <Image
                  src={user?.externalAccounts[0]?.avatarUrl || ""}
                  alt={"album cover"}
                  width={30}
                  height={30}
                  className=" ml-4  aspect-square rounded-full object-cover"
                ></Image>
              </div>
            </div>

            <div className="col-span-2 h-full overflow-y-scroll overscroll-contain  pl-8">
              <div className="mb-10  border-b-2 pt-10 ">
                <span className=" text-6xl text-slate-400 ">
                  Your favorites:
                </span>
              </div>
              <div className="">
                <PersonalFavoritesView></PersonalFavoritesView>
              </div>
            </div>
            <div className=" "></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
