import axios from './axios';

interface AuthData {
  username: string;
  password: string;
}

interface ResponseAuthData {
  status: boolean;
  token: string;
  message?: string;
}

/**
 * Register a new user.
 * @param {AuthData} data - The registration data.
 * @returns {Promise<ResponseAuthData>} - A promise that resolves to the response data.
 */
export async function register(data: AuthData): Promise<ResponseAuthData> {
  const response = await axios().post('/auth/register', data);
  return response.data;
}

/**
 * Login a user.
 * @param {AuthData} data - The login data.
 * @returns {Promise<ResponseAuthData>} - A promise that resolves to the response data.
 */
export async function login(data: AuthData): Promise<ResponseAuthData> {
  const response = await axios().post('/auth/login', data);
  return response.data;
}
