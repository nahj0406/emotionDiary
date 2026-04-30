import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      nickname?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    nickname?: string | null;
    name?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      nickname?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
}