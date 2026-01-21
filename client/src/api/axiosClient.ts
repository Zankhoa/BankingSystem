import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7046/api',
  headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
  },
);

//interceptor xu ly loi chung
axiosClient.interceptors.request.use( 
  (response) => response,
  (error) => {
    if(error.response?.status === 401) {
      //co the dispatch event logout tai day neu muon
      console.log('Unauthorized, logging out ...');
    }
    return Promise.reject(error);
  } 
);


export default axiosClient
