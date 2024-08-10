import { AxiosResponse } from 'axios';
import axios from './axios';
import { LibrarySong } from './types';

/**
 * Get a random song.
 * @param {number} amount - The number of random songs to retrieve.
 * @returns {Promise<LibrarySong[]>} - A promise that resolves to an array of random songs.
 */
export async function getRandomSong(amount: number): Promise<LibrarySong[]> {
  const response: AxiosResponse<LibrarySong[]> = await axios().get(`/song/random/${amount}`);
  return response.data;
}

/**
 * Get song information by ID.
 * @param {string} id - The ID of the song.
 * @returns {Promise<LibrarySong>} - A promise that resolves to the song information.
 */
export async function getSongInfo(id: string): Promise<LibrarySong> {
  const response: AxiosResponse<LibrarySong> = await axios().get(`/song/info/${id}`);
  return response.data;
}