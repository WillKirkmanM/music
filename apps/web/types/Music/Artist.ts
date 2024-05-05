import type Album from "./Album"

export default interface Artist {
  id: number
  name: string
  albums: Album[]
}

