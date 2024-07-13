export default interface Song {
  id: string 
  name: string,
  artist: string,
  contributing_artists: string[],
  track_number: number,
  path: string
  duration: number
}