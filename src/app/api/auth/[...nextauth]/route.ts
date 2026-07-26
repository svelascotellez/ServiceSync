import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const normalizedEmail = credentials.email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
          });

          if (!user) {
            console.log('Login failed: user not found', normalizedEmail);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            console.log('Login failed: invalid password for', normalizedEmail);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            photoUrl: user.photoUrl,
          };
        } catch (err) {
          console.error('Login error in authorize:', err);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.photoUrl = (user as any).photoUrl;
      }
      if (trigger === 'update' && session?.photoUrl) {
        token.photoUrl = session.photoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id || token.sub;
        (session.user as any).photoUrl = token.photoUrl;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "puerto-aventuras-servicesync-secret-key-2026",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
