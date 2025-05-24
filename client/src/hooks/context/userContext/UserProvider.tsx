// UserProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "@/redux/store";
import { logout } from "@/redux/slice/authSlice";
import { fetchUserById } from "@/redux/slice/userSlice";

// تعريف النوع
interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface UserContextType {
  userData: User | null;
  logout: () => void;
  setUserData: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user);
  
  const id = user?.data._id

  const [userData, setUserData] = useState<User | null>(user?.data || null);
  const navigate = useNavigate();

  useEffect(() => {
    setUserData(user?.data || null);
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [user,id,dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logout: handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("يجب استخدام useUser داخل UserProvider.");
  }
  return context;
};
