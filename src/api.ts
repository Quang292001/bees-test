// src/api.ts
import axios from "axios";
import { User } from "./types";

export const fetchUsers = async (count: number): Promise<User[]> => {
  try {
    const response = await axios.get(`https://randomuser.me/api/?results=${count}`);
    const users = response.data.results.map((user: any, index: number) => ({
      id: user.login.uuid,
      name: `${user.name.first} ${user.name.last}`,
      balance: Math.floor(Math.random() * 10000) + 1000, // Tạo số dư ngẫu nhiên từ $1,000 đến $10,000
      email: user.email,
      registration: user.registered.date, // Định dạng ISO string
      status: "Active", // Giả lập status
    }));
    return users;
  } catch (error) {
    throw new Error("Failed to fetch users from API");
  }
};