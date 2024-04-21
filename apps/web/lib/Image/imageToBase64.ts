import fs from "fs"

export default function imageToBase64(src: string) {
  const image = fs.readFileSync(src);
  const base64Image = Buffer.from(image).toString('base64');
  return base64Image;
}