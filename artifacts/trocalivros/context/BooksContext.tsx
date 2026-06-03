import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type BookCondition = "Novo" | "Ótimo" | "Bom" | "Regular";

export const GENRES = [
  "Ficção",
  "Romance",
  "Fantasia",
  "Terror",
  "Aventura",
  "Biografia",
  "História",
  "Ciência",
  "Autoajuda",
  "Infantil",
  "HQ / Mangá",
  "Outro",
];

export const COVER_COLORS = [
  "#C4621A",
  "#2E7D5E",
  "#1A5276",
  "#6C3483",
  "#B7950B",
  "#922B21",
  "#1F618D",
  "#117A65",
  "#784212",
  "#2C3E50",
];

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  condition: BookCondition;
  description: string;
  coverColor: string;
  isOwn: boolean;
  ownerName: string;
  ownerId: string;
  available: boolean;
  createdAt: string;
}

interface BooksContextType {
  myBooks: Book[];
  communityBooks: Book[];
  addBook: (book: Omit<Book, "id" | "createdAt" | "isOwn" | "available">) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  setBookUnavailable: (id: string) => Promise<void>;
}

const BooksContext = createContext<BooksContextType | null>(null);

const MY_BOOKS_KEY = "@trocalivros_my_books";
const COMMUNITY_BOOKS_KEY = "@trocalivros_community_books";

const SAMPLE_COMMUNITY_BOOKS: Book[] = [
  {
    id: "sample_1",
    title: "O Senhor dos Anéis",
    author: "J.R.R. Tolkien",
    genre: "Fantasia",
    condition: "Ótimo",
    description: "A trilogia épica completa. Capa dura, sem riscos.",
    coverColor: "#2E7D5E",
    isOwn: false,
    ownerName: "Ana Lima",
    ownerId: "user_ana",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "sample_2",
    title: "1984",
    author: "George Orwell",
    genre: "Ficção",
    condition: "Bom",
    description: "Edição especial com posfácio. Algumas marcas de leitura.",
    coverColor: "#2C3E50",
    isOwn: false,
    ownerName: "Carlos Souza",
    ownerId: "user_carlos",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "sample_3",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    genre: "Romance",
    condition: "Bom",
    description: "Edição de bolso em bom estado. Leitura tranquila.",
    coverColor: "#C4621A",
    isOwn: false,
    ownerName: "Beatriz Alves",
    ownerId: "user_beatriz",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "sample_4",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "História",
    condition: "Ótimo",
    description: "Quase novo, li uma vez. Ótima condição.",
    coverColor: "#1A5276",
    isOwn: false,
    ownerName: "Diego Ferreira",
    ownerId: "user_diego",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sample_5",
    title: "A Culpa é das Estrelas",
    author: "John Green",
    genre: "Romance",
    condition: "Novo",
    description: "Presente que recebi, nunca li. Lacrado.",
    coverColor: "#6C3483",
    isOwn: false,
    ownerName: "Fernanda Costa",
    ownerId: "user_fernanda",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "sample_6",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    genre: "Fantasia",
    condition: "Regular",
    description: "Muito lido, mas páginas intactas. Capa um pouco gasta.",
    coverColor: "#922B21",
    isOwn: false,
    ownerName: "Gabriel Santos",
    ownerId: "user_gabriel",
    available: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function BooksProvider({ children, userId, userName }: { children: React.ReactNode; userId: string; userName: string }) {
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [communityBooks, setCommunityBooks] = useState<Book[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(MY_BOOKS_KEY),
      AsyncStorage.getItem(COMMUNITY_BOOKS_KEY),
    ]).then(([myRaw, communityRaw]) => {
      if (myRaw) {
        try { setMyBooks(JSON.parse(myRaw)); } catch {}
      }
      if (communityRaw) {
        try { setCommunityBooks(JSON.parse(communityRaw)); } catch {}
      } else {
        setCommunityBooks(SAMPLE_COMMUNITY_BOOKS);
        AsyncStorage.setItem(COMMUNITY_BOOKS_KEY, JSON.stringify(SAMPLE_COMMUNITY_BOOKS));
      }
    });
  }, []);

  const saveMyBooks = useCallback(async (books: Book[]) => {
    setMyBooks(books);
    await AsyncStorage.setItem(MY_BOOKS_KEY, JSON.stringify(books));
  }, []);

  const addBook = useCallback(async (data: Omit<Book, "id" | "createdAt" | "isOwn" | "available">): Promise<Book> => {
    const book: Book = {
      ...data,
      id: generateId(),
      isOwn: true,
      available: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [book, ...myBooks];
    await saveMyBooks(updated);
    return book;
  }, [myBooks, saveMyBooks]);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    const updated = myBooks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    await saveMyBooks(updated);
  }, [myBooks, saveMyBooks]);

  const deleteBook = useCallback(async (id: string) => {
    const updated = myBooks.filter((b) => b.id !== id);
    await saveMyBooks(updated);
  }, [myBooks, saveMyBooks]);

  const getBook = useCallback((id: string): Book | undefined => {
    return myBooks.find((b) => b.id === id) || communityBooks.find((b) => b.id === id);
  }, [myBooks, communityBooks]);

  const setBookUnavailable = useCallback(async (id: string) => {
    const updated = myBooks.map((b) => (b.id === id ? { ...b, available: false } : b));
    await saveMyBooks(updated);
  }, [myBooks, saveMyBooks]);

  return (
    <BooksContext.Provider value={{ myBooks, communityBooks, addBook, updateBook, deleteBook, getBook, setBookUnavailable }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used inside BooksProvider");
  return ctx;
}
