// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    id?: string;
    avatar?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      avatar?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    avatar?: string;
  }
}