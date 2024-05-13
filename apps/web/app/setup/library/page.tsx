import { promises as fs } from "fs"

export default async function SetupLibrary() {
  const cwd = process.cwd()
  let files = await fs.readdir(`${cwd}/`)
  console.log(files)

  return (
    <>
      <p className="text text-center text-4xl py-14">Link your Music Library</p>

      {files.map(file => (
        <p key={file}>{file}</p>
      ))}
    </>
  )
}