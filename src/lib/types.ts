
import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  date: string; // ISO string
  description?: string;
};

export type Category = {
  name: string;
  icon: LucideIcon | any;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  isUserFeature?: boolean;
};

export type GroupedTransactions = {
  [key: string]: Transaction[];
};

export type Budget = {
  id: string;
  name: string;
  goal: number;
  spent: number;
  startDate: Date;
  endDate: Date;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string; // ISO String
  isImportant: boolean;
};

export type SecurityAnswers = {
  bestFriend: string;
  nickname: string;
  petName: string;
}

export type User = {
  fullName: string;
  email: string;
  avatar: string;
  securityAnswers: SecurityAnswers;
  highestGameScore?: number;
  gameHighScores?: number[];

  currency: string;
};

    
