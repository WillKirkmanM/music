import type Album from "./Album"

export default interface Artist {
  id: string 
  name: string
  icon_url: string
  followers: number
  albums: Album[]
  description: string
}