import { NextAuthOptions } from 'next-auth';
import prisma from '@/prisma/prisma';
import { User } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import argon2 from "argon2"

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      id: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'username', placeholder: 'tonybraxton' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == undefined) return null
        if (!credentials.username|| !credentials.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
          },
        });

        let passwordVerified = await argon2.verify(user!.password, credentials.password)
        if (!user || !passwordVerified) {
          return null
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