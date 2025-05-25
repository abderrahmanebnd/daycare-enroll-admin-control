import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import axiosPrivate from "@/axios/axios";
import socket from "@/services/socket";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      socket.emit("register", user.id);
    }
  }, [user]);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      const { user } = data.data;

      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    setIsLoading(true);

    try {
      // Only allow parents to register
      if (role !== "parent") {
        throw new Error("Only parents can self-register");
      }

      const response = await axiosPrivate.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      const data = response.data;

      const { user } = data.data;

      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
