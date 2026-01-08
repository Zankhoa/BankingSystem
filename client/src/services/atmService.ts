import axiosClient from "../api/axiosClient";
import type { APIResponse, WithdrawRequest } from "../types";
export const atmService = {
withdraw: async (data: WithdrawRequest) => {
        // Gọi POST /api/Atm/withdraw
        const response = await axiosClient.post<APIResponse>('/Atm/withdraw', data);
        return response.data;
    }
};