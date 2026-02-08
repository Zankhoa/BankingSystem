import axiosClient from "../api/axiosClient";
import type { LoginRequest, UserInfoDTO, PublicKeyResponse, LoginRespose, CreatePinUserRequest, CreatePinUserResponse} from "../types";

export const authService = {
//lay khoa rsa 
    getPublicKey: async () => {
    const response = await axiosClient.get<PublicKeyResponse>('/Authentication/public-key');
    return response.data;
},

// 2. Login (Chỉ gửi Username và Password đã mã hóa RSA)
    login: async (data: LoginRequest) => {
        // Backend: [HttpPost("login")] -> /api/auth/login
        // Không gửi Header Authorization Basic nữa!
        // Cookie sẽ tự động được Server set (HttpOnly), ta không cần quan tâm token ở đây
        const response = await axiosClient.post<LoginRespose>('/Authentication/login', data);
        return response.data;
    },

// Logout
    logout: async () => {
        await axiosClient.post('/auth/logout');
    },

// Lấy thông tin user (Browser tự gửi cookie đi kèm request này)
    getCurrentUser: async () => {
        const response = await axiosClient.get<UserInfoDTO>('/Authentication/info');
        return response.data;
    },
    
    //tao ma pin
    createPinUser: async (data: CreatePinUserRequest) => {
        const response = await axiosClient.post<CreatePinUserResponse>('/Authentication/pins', data);
        return response.data
    }
};

