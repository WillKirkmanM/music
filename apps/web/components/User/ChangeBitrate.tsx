"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@music/ui/components/select";
import { useSession } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@music/ui/components/form";

const FormSchema = z.object({
  bitrate: z
    .string({
      required_error: "Please select a bitrate.",
    })
});

export default function ChangeBitrate() {
  const session = useSession()
  const selectedBitrate = session.data?.user.bitrate;
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bitrate: selectedBitrate,
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data.bitrate);
  }


return (
  <div className="text-black bg-white">
    <p>{selectedBitrate}</p>
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="bitrate"
        render={({ field }) => (
          <>
            <FormItem>
              <FormLabel>Audio Quality</FormLabel>
            <Select onValueChange={field.onChange} >
              <FormControl>

              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a bitrate" />
              </SelectTrigger>
              </FormControl>

              <SelectContent>
                <SelectItem value="48">Low</SelectItem>
                <SelectItem value="128">Normal</SelectItem>
                <SelectItem value="256">High</SelectItem>
                <SelectItem value="0">Lossless</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Set the audio quality when streaming, Low = 96kbps, Normal = 120kbps...
            </FormDescription>
            <FormMessage />
            </FormItem>
          </>
        )}
      />
    </form>
    </Form>
  </div>
);
}