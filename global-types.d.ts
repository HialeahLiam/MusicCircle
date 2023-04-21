declare global {
  interface UserPublicMetadata {
    spotifyToken?: string;
    isNewUser?: boolean;
  }
}

type A = UserPublicMetadata["spotifyToken"];
