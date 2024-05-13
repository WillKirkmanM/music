"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { ArrowRight } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@music/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@music/ui/components/form"
import { Input } from "@music/ui/components/input"
import { signIn } from "next-auth/react"
import Link from "next/link"

const registerSchema = z.object({
  username: z.string().min(1, { message: "Username must be longer than 1 character" }),
  password: z.string().min(4, { message: "Password must be longer than 4 character" })
})

export default function Register() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  })
 
async function onSubmit(values: z.infer<typeof registerSchema>) {
  try {
    const response = await fetch('/api/auth/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });

    if (response.ok) {
      await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: true,
        callbackUrl: "/account/library"
      })
    }

    if (!response.ok) {
      throw new Error('Response was not ok');
    }

    const newUser = await response.json();
  } catch (error) {
    console.error(error);
  }
}

  return (
    <>
      <title>Account</title>
      <p className="text text-center text-4xl py-14">Tell us About Yourself</p>
      <div className="flex justify-center items-center">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="TonyBraxton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="helloWorld123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              Next
              <ArrowRight className="mr-2 h-4 w-4 ml-2"/> 
            </Button>
            <Link href="/setup/library" className="pl-10 underline">
              I already have an account
            </Link>
        </form>
      </Form>
      </div>
    </>
  )
}