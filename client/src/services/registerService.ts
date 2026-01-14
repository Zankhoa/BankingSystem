import axiosClient from "../api/axiosClient";
import type { RegisterRequest, RegisterResponse,PublicKeyResponse } from "../types";
export const registerService = {
//1 lay public key de ma hoa pw
getPublicKey: async () => {
    const response = await axiosClient.get<PublicKeyResponse>('/Authentication/public-key');
    return response.data;
},
//2 dang ky (register)
register: async (data: RegisterRequest) => {
//goi api de ma vao controller
    const response = await axiosClient.post<RegisterResponse>('/Authentication/register', data);
    return response.data;
}
}