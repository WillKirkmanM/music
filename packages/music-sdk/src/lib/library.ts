import axios from './axios';

/**
 * Index the library at the specified path.
 * @param {string} pathToLibrary - The path to the library.
 * @returns {Promise<string>} - A promise that resolves to a success message.
 */
export async function indexLibrary(pathToLibrary: string): Promise<string> {
  const response = await axios().post('/library/index', {
	path_to_library: pathToLibrary,
  });
  return response.data;
}