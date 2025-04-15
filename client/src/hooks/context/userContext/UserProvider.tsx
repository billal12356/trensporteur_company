import { ReactNode, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { AppDispatch, RootState } from "@/redux/store";
import { logout } from "@/redux/slice/authSlice";

// استيراد نوع المستخدم
interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

// مكون مزود السياق
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [userData, setUserData] = useState<User | null>(user?.data || null);
  const navigate = useNavigate();

  useEffect(() => {
    setUserData(user?.data || null);
  }, [user, userData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <UserContext.Provider value={{ userData, logout: handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};

// هوك مخصص لاستخدام السياق
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("يجب استخدام useUser داخل UserProvider.");
  }
  return context;
};
