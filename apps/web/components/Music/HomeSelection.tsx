import BigCard from "./Card/BigCard"

export default async function HomeSelection() {

  // const json = await fetch("http:/localhost:3001/music.json")
  // let library: Library = await json.json()

  interface Library {
    name: string
    albums: Album[]
  }

  interface Album {
    name: string
    songs: Song[]
  }

  interface Song {
    name: string
    artist: string
    contributing_artists: string[]
    track_number: number
    path: string
  }
  // const firstTenArtists = library.slice(0, 50).map((artist, index) => (
  //   <div key={index}>
  //     <h2 className="text-lg">{artist.name}</h2>
  //     <p>{artist.albums.length} albums</p>
  //   </div>
  // ));

  return (
    <>
      <BigCard title="You Da One" artistName="Rihanna" imageSrc="https://m.media-amazon.com/images/I/51BpyM50BhL._UXNaN_FMjpg_QL85_.jpg" albumURL="" songURL=""/>
    </>
  );
}