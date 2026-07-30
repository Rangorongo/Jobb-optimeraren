import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/auth",
  providers: [Google, LinkedIn],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: user?.name ?? null,
            authProvider: account?.provider ?? "unknown",
          },
        });
        token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
