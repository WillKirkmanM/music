"use client";

import getSession from "@/lib/Authentication/JWT/getSession";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@music/sdk";
import { Button } from "@music/ui/components/button";
import { Input } from "@music/ui/components/input";
import { Label } from "@music/ui/components/label";
import { useForm } from "react-hook-form";
import { z } from "zod";

const changePasswordSchema = z.object({
  password: z
    .string()
    .min(4, { message: "Password must be longer than 4 characters" }),
  confirmPassword: z
    .string()
    .min(4, { message: "Password must be longer than 4 characters" }),
});

export function ChangePassword() {
  const session = getSession()

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    if (data.password === data.confirmPassword) {
        await changePassword(session?.username ?? "", data.password, data.confirmPassword);
    } else {
      // handle password mismatch
    }
  };

return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="password" className="text-right text-black">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="Enter your password"
          className="col-span-2"
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="confirmPassword" className="text-right text-black">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          {...form.register("confirmPassword")}
          placeholder="Confirm your password"
          className="col-span-2"
        />
      </div>
        <Button type="submit" className="w-1/3">Update Password</Button>
    </form>
  );
}