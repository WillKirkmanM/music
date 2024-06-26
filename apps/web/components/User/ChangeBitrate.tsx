"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@music/ui/components/select";
import { useSession } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@music/ui/components/form";
import SetBitrate from "@/actions/Player/SetBitrate";
import { Button } from "@music/ui/components/button";
import { useEffect } from "react";

const FormSchema = z.object({
  bitrate: z.string({
    required_error: "Please select a bitrate.",
  }),
});

export default function ChangeBitrate() {
  const { data: session, update } = useSession();

  const userBitrate = session?.user.bitrate;

  const bitrateMapping: { [key: string]: number } = {
    low: 96,
    normal: 128,
    high: 256,
    lossless: 0,
  };

  const selectedBitrate = Object.keys(bitrateMapping).find(
    (key) => bitrateMapping[key] === userBitrate
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bitrate: selectedBitrate,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const bitrateMapping: {
      [key in z.infer<typeof FormSchema>["bitrate"]]: number;
    } = {
      low: 96,
      normal: 128,
      high: 256,
      lossless: 0,
    };

    const newBitrate = bitrateMapping[data.bitrate];

    if (session && newBitrate !== undefined) {
      SetBitrate(session.user.username, newBitrate);
      update({
        ...session,
        user: {
          ...session.user,
          bitrate: newBitrate,
        },
      });
    }
  }

  function onBitrateChange(value: string) {
    form.setValue("bitrate", value);
    form.trigger("bitrate");
  }

  return (
    <div className="text-black bg-white">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <FormField
            control={form.control}
            name="bitrate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio Quality</FormLabel>
                <Select
                  value={form.watch("bitrate")}
                  onValueChange={onBitrateChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a bitrate" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="bg-white text-black">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="lossless">Lossless</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Set the audio quality when streaming, Low = 96kbps, Normal =
                  128kbps, High = 256kbps...
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
            <Button type="submit" className="w-1/3 mt-4">
              Change Quality
            </Button>
        </Form>
      </form>
    </div>
  );
}
