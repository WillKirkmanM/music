"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@music/ui/button"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@music/ui/dialog"
import { Input } from "@music/ui/input"
import { Label } from "@music/ui/label"
import { toast } from "sonner"
import { User } from "@prisma/client"

const changePasswordSchema = z.object({
  password: z.string().min(4, { message: "Password must be longer than 4 characters" }),
  confirmPassword: z.string().min(4, { message: "Password must be longer than 4 characters" })
})

async function changePassword(user: User, value: string) {
  const response = await fetch('/api/auth/changePassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      password: value
    })
  });

  if (response.ok) {
    toast("Your password has been reset successfully")
  }
}

type ChangePasswordProps = {
  user: User
}

export function ChangePassword({ user }: ChangePasswordProps) {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  })

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    if (data.password === data.confirmPassword) {
      await changePassword(user, data.password);
    } else {
      // handle password mismatch
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Change Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter a new Password
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
              placeholder="Enter your password"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              placeholder="Confirm your password"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}