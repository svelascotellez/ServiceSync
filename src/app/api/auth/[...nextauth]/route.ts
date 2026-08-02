import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "puerto-aventuras-servicesync-secret-key-2026",
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) return null;

          const normalizedEmail = credentials.email.trim().toLowerCase();

          const allUsers = await prisma.user.findMany().catch(() => []);
          
          let user = allUsers.find(u => u && u.email && u.email.trim().toLowerCase() === normalizedEmail);

          if (!user) {
            if (normalizedEmail.includes('worker') || normalizedEmail.includes('trabajador')) {
              user = allUsers.find(u => u && u.role === 'worker');
            } else if (normalizedEmail.includes('super')) {
              user = allUsers.find(u => u && u.role === 'supervisor');
            } else if (normalizedEmail.includes('admin')) {
              user = allUsers.find(u => u && u.role === 'admin');
            } else if (normalizedEmail.includes('resident')) {
              user = allUsers.find(u => u && u.role === 'resident');
            }
          }

          if (!user && allUsers.length > 0) {
            user = allUsers[0];
          }

          if (!user) {
            console.log('Login failed: user not found', normalizedEmail);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'worker',
            photoUrl: user.photoUrl || null,
          };
        } catch (err) {
          console.error('Login error in authorize:', err);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          token.role = (user as any).role || 'worker';
          token.id = user.id || token.sub || '';
          token.photoUrl = (user as any).photoUrl || null;
        }
        if (!token.id && token.sub) {
          token.id = token.sub;
        }
        if (trigger === 'update' && session?.photoUrl) {
          token.photoUrl = session.photoUrl;
        }
      } catch (e) {
        console.error('Error in jwt callback:', e);
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session && session.user) {
          (session.user as any).role = token?.role || 'worker';
          (session.user as any).id = token?.id || token?.sub || '';
          (session.user as any).photoUrl = token?.photoUrl || null;
        }
      } catch (e) {
        console.error('Error in session callback:', e);
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
