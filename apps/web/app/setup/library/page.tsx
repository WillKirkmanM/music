import getConfig from "@/actions/Config/getConfig"
import { Button } from "@music/ui/components/button"
import { promises as fs } from "fs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
async function indexLibrary() {
  "use server"
  try {
    const response = await fetch(`http://127.0.0.1:3001/library/index/Music`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await response.json();
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Failed to index library:", error);
  }
}

export const dynamic = "force-dynamic"

export default async function SetupLibrary() {
  let files = await fs.readdir(`/`)

  return (
    <>
      <p className="text text-center text-4xl py-14">Link your Music Library</p>

      <form action={indexLibrary}>
        <Button>Index Music Library</Button>
      </form>

Files
      {files.map(file => (
        <p key={file}>{file}</p>
      ))}
    </>
  )
}