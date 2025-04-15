import { createContext } from "react";

// تعريف نوع المستخدم
interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

// تعريف نوع بيانات السياق
interface UserContextType {
  userData: User | null;
  logout: () => void;
}

// إنشاء السياق
export const UserContext = createContext<UserContextType | undefined>(undefined);
