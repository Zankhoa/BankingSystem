import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7046/api',
  headers: {
    'Content-Type': 'application/json',
    withCredentials: true,
  },
});

//tu dong them token vao header
axiosClient.interceptors.response.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Autherization = `Bearer ${token}`;
    return config;
  }, 
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use((response) => {
return response;
}, (error) => {
  if(error.response && error.response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
  }
  return Promise.reject(error);
  });
  
export default axiosClient
