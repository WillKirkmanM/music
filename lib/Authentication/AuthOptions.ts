import { NextAuthOptions } from 'next-auth';
import prisma from '@/prisma/prisma';
import { User } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter"

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      id: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null; // validate
        }

        console.log("Looking for user in prisma db")
        const user = await prisma.user.findUnique({
          where: {
            email: String(credentials.email),
          },
        });
        console.log("FOUND USER? ", user)

        if (
          !user ||
          // !(await crypto.compare(String(credentials.password), user.password!))
          !user
        ) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u: User & { randomKey: string } = user as User & { randomKey: string };
        return {
          ...token,
          id: u.id,
          username: u.username,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
    session(params) {
      return {
        ...params.session,
        user: {
          ...params.session.user,
          id: params.token.id as string,
          username: params.token.username,
          randomKey: params.token.randomKey,
        },
      };
    },
  },
};