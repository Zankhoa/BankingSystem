import type { TransactionHisoryResponse } from "../types";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi/VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getFriendlyDate = (dateString: Date) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

    if(date.toDateString() === today.toDateString()) return "Hôm nay";
    if(date.toDateString() === yesterday.toDateString()) return "Hôm qua";
    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month:"2-digit",
        year:"numeric",
    });
};

//ham gom transaction theo ngay
export const groupTransactionsByDate = (transactions: TransactionHisoryResponse[]) => {
    const groups: {[key: string]: {title: string; items:TransactionHisoryResponse[]}} = {};
    transactions.forEach((item) => {
        const dataKey = new Date(item.CreateAt).toDateString();
        if(!groups[dataKey]){
            groups[dataKey] = {
                title: getFriendlyDate(item.CreateAt),
                items: [],
            };
        }
        groups[dataKey].items.push(item);
    });
    return Object.values(groups);
}
