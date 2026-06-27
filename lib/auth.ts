import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "dummy-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy-github-client-secret",
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [
          CredentialsProvider({
            id: "credentials",
            name: "Demo Account",
            credentials: {
              username: { label: "Username", type: "text", placeholder: "demo-developer" },
            },
            async authorize(credentials) {
              return {
                id: "mock-user-id",
                name: credentials?.username || "Demo Developer",
                email: "demo@devtrack.ai",
                image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
              };
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      try {
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        });

        let dbUser;
        if (existingAccount) {
          dbUser = existingAccount.user;
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              name: user.name || dbUser.name,
              image: user.image || dbUser.image,
              email: user.email || dbUser.email,
            },
          });
        } else {
          if (user.email) {
            dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
          }

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email || null,
                name: user.name,
                image: user.image,
              },
            });
          }
        }

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token || "mock_token",
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token || "mock_token",
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
        const dbAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });
        if (dbAccount) {
          token.userId = dbAccount.userId;
          token.accessToken = dbAccount.access_token || account.access_token;
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
  secret: process.env.NEXTAUTH_SECRET || "development-fallback-secret-key-12345",
  pages: {
    signIn: "/",
    error: "/",
  },
};
