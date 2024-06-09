import type Song from "./Song"

export default interface Album {
  id: number
  name: string
  cover_url: string
  description: string
  songs: Song[]
  first_release_date: string
  musicbrainz_id: string
  wikidata_id: string | null
  primary_type: string
}