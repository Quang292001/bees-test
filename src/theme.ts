// src/theme.ts

export interface Theme {
    background: string;
    text: string;
    border: string;
    hover: string;
  }
  
  // Định nghĩa theme cho light và dark mode
  export const lightTheme: Theme = {
    background: "#fff",
    text: "#333",
    border: "#ddd",
    hover: "#f9f9f9",
  };
  
  export const darkTheme: Theme = {
    background: "#333",
    text: "#fff",
    border: "#555",
    hover: "#444",
  };