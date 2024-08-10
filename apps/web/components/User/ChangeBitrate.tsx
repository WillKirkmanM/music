"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@music/ui/components/select";

import getSession from "@/lib/Authentication/JWT/getSession";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBitrate } from "@music/sdk";
import { Button } from "@music/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@music/ui/components/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  bitrate: z.string({
    required_error: "Please select a bitrate.",
  }),
});

export default function ChangeBitrate() {
  const bitrateMapping: { [key: string]: number } = {
    low: 96,
    normal: 128,
    high: 256,
    lossless: 0,
  };

  const selectedBitrate = Object.keys(bitrateMapping).find(
    (key) => bitrateMapping[key] === 0
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

    if (newBitrate !== undefined) {
      const session = getSession()
      setBitrate(Number(session?.sub), newBitrate);
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
