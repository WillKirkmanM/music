"use server"

import { revalidatePath, revalidateTag } from "next/cache"

export async function RevalidateAll() {
  revalidatePath("/")
}

export async function RevalidatePath(path: string) {
  revalidatePath(path)
}

export async function RevalidateTag(tag: string) {
  revalidateTag(tag)
}