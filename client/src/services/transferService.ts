import axiosClient from "../api/axiosClient";
import type { TransferRequest } from "../types";
export const transferService = {
    transfer: async (data: TransferRequest) => {
        const response = await axiosClient.post('Transaction/transfer', data);
        return response.data;
    },
    getPublicKey: async () =>{
        const response = await axiosClient.post('Transaction/getPublicKey');
        return response.data;
    },
    getInfo: async (accountNumber: string) => {
        const response = await axiosClient.post('Transaction/getInfo', {accountNumber});
        return response.data;
    }
};