import type Song from "./Song"

export default interface Album {
  name: string
  cover_url: string
  songs: Song[]
}
