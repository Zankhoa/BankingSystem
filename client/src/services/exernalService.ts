import axiosClient from "../api/axiosClient";
import type { PublicKeyResponse, TransferExternalRequest } from "../types";

export const externalService = {
     transferExternal: async (data: TransferExternalRequest) => {
        const response = await axiosClient.post('TransferExternal/transfer-external', data);
        return response.data;
    },
    getPublicKey: async () =>{
        const response = await axiosClient.get<PublicKeyResponse>('TransferExternal/key-public');
        return response.data;
    },
    checkPin: async() => {
        const response = await axiosClient.post("TransferExternal/checkPin");
        return response.data;
    }

}