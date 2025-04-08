// src/types.ts
export interface User {
    id: string;
    name: string;
    balance: number;
    email: string;
    registration: string; // Định dạng ISO string để lưu ngày giờ đầy đủ
    status: string;
  }