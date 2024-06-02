export default interface Song {
  id: number
  name: string,
  artist: string,
  contributing_artists: string[],
  track_number: number,
  path: string
  duration: number
}