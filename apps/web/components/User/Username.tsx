"use client"

import { User } from "@prisma/client"
import { Input } from "../ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type UsernameProps = {
  username: string
}

export default function Username({ username }: UsernameProps) {

  const FormSchema = z.object({
    username: z.string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .refine(value => !value.includes(' '), {
        message: "Username cannot contain a space",
      }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "", 
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data.username)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/6 space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder={username} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}