import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      nickname?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id?: string | null;
    nickname?: string | null;
    name?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id?: string | null;
      nickname?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
}