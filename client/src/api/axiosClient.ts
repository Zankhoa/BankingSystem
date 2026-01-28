import axios, { type InternalAxiosRequestConfig } from "axios";
import CryptoJS from "crypto-js";

const axiosClient = axios.create({
  baseURL: "https://localhost:7046/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const SKIP_SIGNATURE_URLS = ["/Authentication/login", "/Authentication/register", "/Authentication/login"];

// type FailedQueueItem = {
//   resolve: (token: string | null) => void;
//   reject: (error: unknown) => void;
// };

// let isRefreshing = false;
// let failedQueue: FailedQueueItem[] = [];

// const processQueue = (error: unknown, token: string | null = null): void => {
//   failedQueue.forEach((item) => {
//     if (error) {
//       item.reject(error);
//     } else {
//       item.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

//
// ================= REQUEST INTERCEPTOR (KÝ REQUEST)
//
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
     const url = config.url ?? "";
         if (SKIP_SIGNATURE_URLS.some(path => url.includes(path))) {
      return config;
    }
    if (config.method !== "get" && config.data) {
      const secretKey = sessionStorage.getItem("signature");

      if (secretKey) {
        try {
          const payload = JSON.stringify(config.data);
          const signature = CryptoJS.HmacSHA256(payload, secretKey).toString();

          // Fix TypeScript
          config.headers = config.headers ?? {};
          config.headers["X-Signature"] = signature;
        } catch (error) {
          console.error("Lỗi ký request:", error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//
// ================= RESPONSE INTERCEPTOR (REFRESH TOKEN)
//
// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })  
//           .then(() => axiosClient(originalRequest))
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         await axiosClient.post("/Authentication/refreshToken", {});
//         processQueue(null);
//         return axiosClient(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError);
//         console.error("Refresh token failed → login again");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosClient;

