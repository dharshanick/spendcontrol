import {
  Banknote,
  Car,
  Clapperboard,
  Gift,
  HandPlatter,
  Home,
  PiggyBank,
  Popcorn,
  ShoppingBag,
  Target,
  Train,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";
import type { Category } from "./types";

export const categories: Category[] = [
  { name: "Salary", icon: Banknote },
  { name: "Groceries", icon: ShoppingBag },
  { name: "Rent", icon: Home },
  { name: "Utilities", icon: HandPlatter },
  { name: "Transport", icon: Car },
  { name: "Dining Out", icon: Popcorn },
  { name: "Entertainment", icon: Clapperboard },
  { name: "Gifts", icon: Gift },
  { name: "Savings", icon: PiggyBank },
  { name: "Travel", icon: Train },
  { name: "Budget", icon: Target },
  { name: "Adjustment", icon: CircleDollarSign },
  { name: "Expenses", icon: WalletCards },
];

export const getCategoryIcon = (categoryName: string) => {
  const category = categories.find((c) => c.name === categoryName);
  return category ? category.icon : HandPlatter;
};
