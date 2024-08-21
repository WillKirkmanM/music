"use client"

import getSession from "@/lib/Authentication/JWT/getSession"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadProfilePicture } from "@music/sdk"
import { Button } from "@music/ui/components/button"
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@music/ui/components/form"
import { Input } from "@music/ui/components/input"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const FormSchema = z.object({
  picture: z.instanceof(File).optional(),
})

export default function SettingsPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      picture: undefined,
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const session = getSession()
    const userId = Number(session?.sub)

    if (file) {
      try {
        await uploadProfilePicture(userId, file)
        setMessage("Profile picture uploaded successfully")
      } catch (error: any) {
        setMessage(`Error uploading profile picture: ${error.message}`)
      }
    } else {
      setMessage("No file selected. Please select a file to upload.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-1/2">
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <FormItem>
              <FormLabel htmlFor="picture">Picture</FormLabel>
              <FormControl>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            {message && <p>{message}</p>}
            <Button type="submit">Upload</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}