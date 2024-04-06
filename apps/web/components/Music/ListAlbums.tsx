export default async function ListAlbums() {
  let res = await fetch("http://127.0.0.1:" + process.env.BACKEND_PORT + "/library/index/C%3A%2FUsers%2Fwilli%2FDocuments%2FLawliet%2FMusic")
  let albums = await res.json()

  type Song = {
  track_number: number;
  name: string;
  };

  type Album = {
    [albumName: string]: Song[];
  };

  type Albums = {
    [artistName: string]: Album;
  };

  return (
    <div>
      {Object.keys(albums).map((artist, index) => (
        <div key={index}>
          <div>{artist}</div>
          {Object.keys(albums[artist]).map((album, index) => (
            <div key={index} style={{marginLeft: '20px'}}>
              <div>{album}</div>
              {albums[artist][album].sort((a: Song, b: Song) => a.track_number - b.track_number).map((song: Song, index: number) => (
                <div key={index} style={{marginLeft: '40px'}}>
                  {song.track_number}: {song.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}