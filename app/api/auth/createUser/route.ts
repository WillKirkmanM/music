import prisma from '@/prisma/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  const credentials = await req.json()
    const values = registerSchema.safeParse(credentials);

    if (!values.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
      const newUser = await prisma.user.create({
        data: {
          username: values.data.username,
          password: values.data.password,
        },
      });

      return NextResponse.json({ newUser }, { status: 200 })
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'An error occurred while creating the user' }, { status: 400 })
    }
}
