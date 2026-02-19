import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { DEMO_CREDENTIALS } from "@/lib/demo";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { assertProductionReady } from "@/lib/production";

assertProductionReady("auth");

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

const providers: NextAuthOptions["providers"] = [];

providers.push(
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;
      const normalizedEmail = email.toLowerCase();

      // Demo-only fast path for local preview accounts.
      if (
        env.features.demoMode &&
        normalizedEmail === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password
      ) {
        try {
          const demoPasswordHash = await bcrypt.hash(DEMO_CREDENTIALS.password, 10);
          const demoUser = await prisma.user.upsert({
            where: { email: DEMO_CREDENTIALS.email },
            update: {
              name: "Demo User",
              passwordHash: demoPasswordHash,
              isPremium: true,
              subscriptionStatus: SubscriptionStatus.active
            },
            create: {
              email: DEMO_CREDENTIALS.email,
              name: "Demo User",
              passwordHash: demoPasswordHash,
              isPremium: true,
              subscriptionStatus: SubscriptionStatus.active
            }
          });

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            image: demoUser.image,
            isPremium: demoUser.isPremium,
            subscriptionStatus: demoUser.subscriptionStatus
          };
        } catch {
          // Last-resort fallback for local preview when DB isn't ready.
          return {
            id: "demo-local-user",
            email: DEMO_CREDENTIALS.email,
            name: "Demo User",
            image: null,
            isPremium: true,
            subscriptionStatus: SubscriptionStatus.active
          };
        }
      }

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user?.passwordHash) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus
      };
    }
  })
);

if (env.auth.googleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  );
}

if (env.auth.emailConfigured) {
  providers.push(
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: identifier,
            subject: "Your TypeForge sign in link",
            html: `<p>Use this link to sign in:</p><p><a href=\"${url}\">${url}</a></p>`
          })
        });
      }
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isPremium = Boolean(user.isPremium);
        token.subscriptionStatus = user.subscriptionStatus ?? SubscriptionStatus.inactive;
      }

      if (!token.id) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { isPremium: true, subscriptionStatus: true }
      });
      token.isPremium = dbUser?.isPremium ?? false;
      token.subscriptionStatus = dbUser?.subscriptionStatus ?? SubscriptionStatus.inactive;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPremium = Boolean(token.isPremium);
        session.user.subscriptionStatus = parseSubscriptionStatus(token.subscriptionStatus as string | undefined);
      }
      return session;
    }
  }
};

export const authUiHints = {
  showGoogle: env.auth.googleConfigured,
  showEmailMagicLink: env.auth.emailConfigured,
  showDemoLogin: env.features.demoMode,
  demoAccount: DEMO_CREDENTIALS
};
const parseSubscriptionStatus = (value: string | undefined): SubscriptionStatus => {
  const allowed = new Set<SubscriptionStatus>([
    SubscriptionStatus.inactive,
    SubscriptionStatus.trialing,
    SubscriptionStatus.active,
    SubscriptionStatus.past_due,
    SubscriptionStatus.canceled,
    SubscriptionStatus.unpaid
  ]);
  return allowed.has(value as SubscriptionStatus) ? (value as SubscriptionStatus) : SubscriptionStatus.inactive;
};
