import type Album from "./Album"

export default interface Artist {
  id: number
  name: string
  icon_url: string
  followers: number
  albums: Album[]
  description: string
}