
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Todo } from '@/lib/types';
import { useTodos } from './use-todos';
import { isPast, parseISO, addMinutes } from 'date-fns';

type SnoozedTodo = {
  id: string;
  snoozeUntil: string; // ISO string
};

type ReminderContextType = {
  dueTodo: Todo | null;
  setDueTodo: (todo: Todo | null) => void;
  snoozeTodo: (todoId: string) => void;
  billReminders: boolean;
  setBillReminders: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
};

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const { todos } = useTodos();
  const [dueTodo, setDueTodo] = useState<Todo | null>(null);
  const [snoozedTodos, setSnoozedTodos] = useState<SnoozedTodo[]>([]);
  const [billReminders, setBillReminders] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const snoozeTodo = (todoId: string) => {
    const newSnooze: SnoozedTodo = {
      id: todoId,
      snoozeUntil: addMinutes(new Date(), 5).toISOString(),
    };
    setSnoozedTodos(prev => [...prev.filter(st => st.id !== todoId), newSnooze]);
  };

  useEffect(() => {
    if (!billReminders) {
      setDueTodo(null); // Clear any active reminder if settings are turned off
      return;
    };

    const checkReminders = () => {
      // Clean up old snoozes
      setSnoozedTodos(prev => {
        const activeSnoozes = prev.filter(st => !isPast(parseISO(st.snoozeUntil)));
        if (activeSnoozes.length < prev.length) {
          return activeSnoozes;
        }
        return prev;
      });

      const pendingImportantTodos = todos.filter(t => !t.completed && t.isImportant);

      for (const todo of pendingImportantTodos) {
        const dueDate = parseISO(todo.dueDate);
        const isSnoozed = snoozedTodos.some(st => st.id === todo.id && !isPast(parseISO(st.snoozeUntil)));

        if (isPast(dueDate) && !isSnoozed && (!dueTodo || dueTodo.id !== todo.id)) {
          // Trigger browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("SpendControl Reminder", {
              body: `Your task "${todo.text}" is due!`,
              icon: "/icon-192x192.png",
            });
            if (vibrationEnabled && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          } else if (vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]); // Vibrate pattern
          }

          setDueTodo(todo);
          break; // Show one reminder at a time
        }
      }
    };

    // Check for reminders every 30 seconds
    const intervalId = setInterval(checkReminders, 30 * 1000);

    // Initial check
    checkReminders();

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    return () => clearInterval(intervalId);

  }, [todos, billReminders, dueTodo, vibrationEnabled, snoozedTodos]);

  return (
    <ReminderContext.Provider value={{ dueTodo, setDueTodo, snoozeTodo, billReminders, setBillReminders, vibrationEnabled, setVibrationEnabled }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};
