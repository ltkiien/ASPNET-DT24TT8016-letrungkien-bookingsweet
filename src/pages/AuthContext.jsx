import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMe, logoutApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục thông tin người dùng khi tải lại trang
  useEffect(() => {
    let cancelled = false;

    const restoreUser = async () => {
      const token = localStorage.getItem("token");

      
      if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log("Restoring user with token:", token);
        try {
            const userData = await getMe();

        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Không thể khôi phục user:", error);

        if (!cancelled) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restoreUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Lưu thông tin sau khi đăng nhập
  const loginUser = useCallback((userData) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    setUser(userData);
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role?.toLowerCase() === "admin",
      isStaff: user?.role?.toLowerCase() === "staff",
      loginUser,
      logout,
      setUser,
    }),
    [user, loading, loginUser, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }

  return context;
}