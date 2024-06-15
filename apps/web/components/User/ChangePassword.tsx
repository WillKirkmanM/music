"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@music/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@music/ui/components/dialog";
import { Input } from "@music/ui/components/input";
import { Label } from "@music/ui/components/label";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import ChangePasswordRequest from "@/actions/Authentication/ChangePassword";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@music/ui/components/form";

const changePasswordSchema = z.object({
  password: z
    .string()
    .min(4, { message: "Password must be longer than 4 characters" }),
  confirmPassword: z
    .string()
    .min(4, { message: "Password must be longer than 4 characters" }),
});

export function ChangePassword() {
  const session = useSession();
  const username = session.data?.user.username ?? "";

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    if (data.password === data.confirmPassword) {
      await ChangePasswordRequest(username, data.password);
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