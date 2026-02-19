import { SubscriptionStatus } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isPremium: boolean;
      subscriptionStatus: SubscriptionStatus;
    };
  }

  interface User {
    isPremium: boolean;
    subscriptionStatus: SubscriptionStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPremium?: boolean;
    subscriptionStatus?: SubscriptionStatus;
  }
}
