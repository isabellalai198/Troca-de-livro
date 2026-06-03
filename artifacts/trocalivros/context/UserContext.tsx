import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  city: string;
  bio: string;
}

const DEFAULT_USER: User = {
  id: "user_me",
  name: "Meu Perfil",
  city: "São Paulo",
  bio: "Apaixonado por leitura e novas histórias.",
};

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const STORAGE_KEY = "@trocalivros_user";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const updateUser = async (updates: Partial<User>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
