"use server"

import prisma from '@/prisma/prisma';
import { z } from 'zod';
import argonHash from '@/lib/Validation/argonHash';

export default async function ChangePassword(username: string, newPassword: string) {
  const passwordSchema = z.object({
    password: z.string().min(4, { message: "Password must be at least 4 characters long." }),
  });

  const values = passwordSchema.safeParse(newPassword);

  const hashedPassword = await argonHash(values.data?.password ?? "")

  await prisma.user.update({
    where: { username },
    data: { password: hashedPassword }
  })
}