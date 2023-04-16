import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import React, { useEffect } from "react";
import Clerk from "@clerk/clerk-js";
import { env } from "~/env.mjs";

/**
 * The reason I call handleRedirectCallback directly instead of just rendering AuthenticateWithRedirectCallback
 * is that the component was calling the clark sign_up endpoint twice for some reason, resulting in a "user with that identification
 * already exists" error
 */
async function foo() {
  const clerk = new Clerk(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  await clerk.load({});
  await clerk.handleRedirectCallback({ redirectUrl: "/" });
}
console.log("load");
function SSOCallback() {
  foo().catch((err) => console.log(err));
  return <div></div>;
}

export default SSOCallback;
