import axios from 'axios';

const createAxiosInstance = () => {
  const server = JSON.parse(localStorage.getItem('server') || '{}');
  const localAddress = server.local_address || window.location.origin;

  return axios.create({
    baseURL: `${localAddress}/api`,
    withCredentials: true
  });
};

export default createAxiosInstance;