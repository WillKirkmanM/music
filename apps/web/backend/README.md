# Music Backend
> The backend to the self-hosted audio and video streaming website

## Get Started
```
$ cargo run
```
## Indexing Performance

| Songs | Time (s) |
|-------|----------|
| 5517  | 0.250    |

### Cover Art Indexing Time
Due to the [Musicbrainz rate limit]( https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting), finding the cover art URL for their respective albums will be at a maximum of 1 request per second.