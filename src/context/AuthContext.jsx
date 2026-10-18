import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const loginUser = (data) => {
        console.log("Logging in user:", data);
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("user", JSON.stringify(data));

        setUser(data?.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    };
    
    console.log("AuthContext user:", user);
    return (
        <AuthContext.Provider
            value={{
                user,
                loginUser,
                logout,
                isAuthenticated: !!user,
                isAdmin: user?.role === "Admin",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}