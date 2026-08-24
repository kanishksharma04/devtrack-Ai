import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const isProduction = process.env.NODE_ENV === "production";

// Fail fast on missing secrets in production rather than silently falling
// back to a value that's checked into git history and known to anyone who
// can read the source — that fallback would make sessions forgeable.
if (isProduction && !process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set in production.");
}
if (isProduction && (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in production.");
}

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
          // Deliberately do NOT look up an existing User by email here. Linking a
          // new OAuth account to an existing user based on email match is the
          // "dangerous email account linking" behavior NextAuth opts out of by
          // default — an email that gets reassigned/recycled on the provider's
          // side would let its new owner sign in and inherit the original
          // account's session. Always create a fresh user when no Account row
          // matches; the email's unique constraint makes this fail closed
          // (sign-in is denied, not silently merged) if it were ever to collide.
          dbUser = await prisma.user.create({
            data: {
              email: user.email || null,
              name: user.name,
              image: user.image,
            },
          });
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
        session.user.id = token.userId;
        session.accessToken = token.accessToken;
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

/**
 * Returns the signed-in user's database ID, or null when unauthenticated.
 * Centralizes the session/user/id null-checks that every page and API
 * route otherwise had to repeat.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Same as {@link getSessionUserId}, but also requires a GitHub access token. */
export async function getSessionWithAccessToken(): Promise<{ userId: string; accessToken: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) return null;
  return { userId: session.user.id, accessToken: session.accessToken };
}
