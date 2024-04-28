import type Song from "./Song"

export default interface Album {
  id: number
  name: string
  cover_url: string
  songs: Song[]
}
