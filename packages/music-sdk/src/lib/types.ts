export type User = {
	id: number;
	name?: string;
	username: string;
	password: string;
	image?: string;
	bitrate: number;
	createdAt: Date;
	updatedAt: Date;
	nowPlaying?: number;
};

export type NewUser = {
	username: string;
	password: string;
};

export type SearchItem = {
	id: number;
	userId: number;
	search: string;
	createdAt: Date;
};

export type NewSearchItem = {
	userId: number;
	search: string;
};

export type ListenHistoryItem = {
	id: number;
	userId: number;
	songId: string;
	listenedAt: Date;
};

export type NewListenHistoryItem = {
	userId: number;
	songId: string;
};

export type Follow = {
	id: number;
	followerId: number;
	followingId: number;
};

export type NewFollow = {
	followerId: number;
	followingId: number;
};

export type Playlist = {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

export type Song = {
	id: number;
};

export type PlaylistToUser = {
	a: number;
	b: number;
};

export type PlaylistToSong = {
	a: number;
	b: number;
};

export type Account = {
	id: string;
	userId: number;
	providerType: string;
	providerId: string;
	providerAccountId: string;
	refreshToken?: string;
	accessToken?: string;
	accessTokenExpires?: Date;
	createdAt: Date;
	updatedAt: Date;
};

export type Session = {
	id: string;
	userId: number;
	expires: Date;
	sessionToken: string;
	accessToken: string;
	createdAt: Date;
	updatedAt: Date;
};

export interface Artist {
  id: number 
  name: string
  icon_url: string
  followers: number
  albums: Album[]
  description: string
}

export interface Album {
  id: number, 
  name: string
  cover_url: string
  description: string
  songs: LibrarySong[]
  first_release_date: string
  musicbrainz_id: string
  wikidata_id: string | null
  primary_type: string
}

export interface LibrarySong {
    id: number;
    name: string;
    artist: string;
    contributing_artists: string[];
    track_number: number;
    path: string;
    duration: number;
    album_object: Album;
    artist_object: Artist;
};

export interface ArtistInfo {
	id: string;
	name: string;
	icon_url?: string;
	followers?: number;
}

export interface AlbumInfo {
	id: string;
	name: string;
	cover_url?: string;
	first_release_date?: string;
}

export interface SongInfo {
	id: string;
	name: string;
	duration: number;
	path: string;
}

export interface CombinedItem {
  item_type: string;
  name: string;
  id: string;
  description?: string;
  acronym?: string;
  artist_object?: ArtistInfo;
  album_object?: AlbumInfo;
  song_object?: SongInfo;
}

export interface ServerInfo {
  local_address: string;
  server_name: string;
  version: string;
  product_name: string;
  startup_wizard_completed: boolean;
  login_disclaimer: string;
}