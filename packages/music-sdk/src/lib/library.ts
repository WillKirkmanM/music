import axios from './axios';

/**
 * Index the library at the specified path.
 * @param {string} pathToLibrary - The path to the library.
 * @returns {Promise<string>} - A promise that resolves to a success message.
 */
export async function indexLibrary(pathToLibrary: string): Promise<string> {
  const encodedPath = encodeURIComponent(pathToLibrary);
  const response = await axios.get(`/library/index/${encodedPath}`, {
    baseURL: ''
  });
  return response.data;
}