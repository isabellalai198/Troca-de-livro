import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type TradeStatus = "pending" | "accepted" | "rejected";

export interface Trade {
  id: string;
  myBookId: string;
  myBookTitle: string;
  theirBookId: string;
  theirBookTitle: string;
  theirOwnerName: string;
  status: TradeStatus;
  direction: "sent" | "received";
  createdAt: string;
}

interface TradesContextType {
  trades: Trade[];
  requestTrade: (trade: Omit<Trade, "id" | "createdAt" | "status" | "direction">) => Promise<void>;
  respondTrade: (id: string, accept: boolean) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  pendingSentCount: number;
  pendingReceivedCount: number;
}

const TradesContext = createContext<TradesContextType | null>(null);

const STORAGE_KEY = "@trocalivros_trades";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SAMPLE_TRADES: Trade[] = [
  {
    id: "trade_sample_1",
    myBookId: "",
    myBookTitle: "Nenhum",
    theirBookId: "sample_1",
    theirBookTitle: "O Senhor dos Anéis",
    theirOwnerName: "Ana Lima",
    status: "pending",
    direction: "received",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setTrades(JSON.parse(raw)); } catch {}
      } else {
        setTrades(SAMPLE_TRADES);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TRADES));
      }
    });
  }, []);

  const saveTrades = useCallback(async (updated: Trade[]) => {
    setTrades(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const requestTrade = useCallback(async (data: Omit<Trade, "id" | "createdAt" | "status" | "direction">) => {
    const trade: Trade = {
      ...data,
      id: generateId(),
      status: "pending",
      direction: "sent",
      createdAt: new Date().toISOString(),
    };
    await saveTrades([trade, ...trades]);
  }, [trades, saveTrades]);

  const respondTrade = useCallback(async (id: string, accept: boolean) => {
    const updated = trades.map((t) =>
      t.id === id ? { ...t, status: accept ? ("accepted" as TradeStatus) : ("rejected" as TradeStatus) } : t
    );
    await saveTrades(updated);
  }, [trades, saveTrades]);

  const deleteTrade = useCallback(async (id: string) => {
    await saveTrades(trades.filter((t) => t.id !== id));
  }, [trades, saveTrades]);

  const pendingSentCount = trades.filter((t) => t.direction === "sent" && t.status === "pending").length;
  const pendingReceivedCount = trades.filter((t) => t.direction === "received" && t.status === "pending").length;

  return (
    <TradesContext.Provider value={{ trades, requestTrade, respondTrade, deleteTrade, pendingSentCount, pendingReceivedCount }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradesContext);
  if (!ctx) throw new Error("useTrades must be used inside TradesProvider");
  return ctx;
}
