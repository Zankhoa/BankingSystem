import axiosClient from "../api/axiosClient";
import type { TransactionHisoryResponse, TransactionHistoryRequest } from "../types";

export const historyService = {
  GetHistoryTransaction: async (data: TransactionHistoryRequest) => {
    const result = await axiosClient.post<TransactionHisoryResponse[]>("Transaction/history", data);
    return result.data;
  }
};
