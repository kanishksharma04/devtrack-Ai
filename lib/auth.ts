import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
          },
        });

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.accessToken = account.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/",
  },
};
