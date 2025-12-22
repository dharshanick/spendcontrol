"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  resetTransactions: () => void;
  isAddExpenseModalOpen: boolean;
  setAddExpenseModalOpen: (isOpen: boolean) => void;
  isAddIncomeModalOpen: boolean;
  setAddIncomeModalOpen: (isOpen: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  // 1. Start Empty (Safe for Server/Vercel)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setAddIncomeModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 2. Load Data (Client-Side Only)
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendcontrol_transactions");
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load transactions");
      }
    }
  }, []);

  // 3. Save Data (Whenever transactions change)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("spendcontrol_transactions", JSON.stringify(transactions));
    }
  }, [transactions, mounted]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]); // Add new to top
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const resetTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionsContext.Provider value={{ 
        transactions, 
        addTransaction, 
        deleteTransaction,
        updateTransaction,
        resetTransactions,
        isAddExpenseModalOpen,
        setAddExpenseModalOpen,
        isAddIncomeModalOpen,
        setAddIncomeModalOpen,
        editingTransaction,
        setEditingTransaction,
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};