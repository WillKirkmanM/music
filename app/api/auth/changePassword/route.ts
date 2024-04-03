import prisma from '@/prisma/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import argon2 from "argon2"
import crypto from "crypto"
import argonHash from '@/lib/Validation/argonHash';

const passwordSchema = z.object({
  userId: z.string(),
  password: z.string().min(4, { message: "Password must be at least 4 characters long." }),
});

export async function POST(req: Request) {
  const properties = await req.json()
  const values = passwordSchema.safeParse(properties);

  if (!values.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const hashedPassword = await argonHash(values.data.password)

  try {
    await prisma.user.update({
      where: { id: values.data.userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while updating the password' }, { status: 400 })
  }
}
