
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Todo } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type TodosContextType = {
  todos: Todo[];
  addTodo: (text: string, dueDate: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodoDate: (id: string, dueDate: string) => void;
  toggleTodoImportance: (id: string) => void;
  resetTodos: () => void;
};

const TodosContext = createContext<TodosContextType | undefined>(undefined);

const sortTodos = (todos: Todo[]) => {
    return todos.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string, dueDate: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      dueDate,
      isImportant: false,
    };
    setTodos(prevTodos => sortTodos([newTodo, ...prevTodos]));
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos =>
      sortTodos(
        prevTodos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      )
    );
  };
  
  const toggleTodoImportance = (id: string) => {
    setTodos(prevTodos =>
      sortTodos(
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
        )
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => sortTodos(prevTodos.filter(todo => todo.id !== id)));
  };
  
  const updateTodoDate = (id: string, dueDate: string) => {
    setTodos(prevTodos =>
      sortTodos(
        prevTodos.map(todo =>
            todo.id === id ? { ...todo, dueDate } : todo
        )
      )
    );
  };

  const resetTodos = () => {
    setTodos([]);
  };

  return (
    <TodosContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, updateTodoDate, toggleTodoImportance, resetTodos }}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
};
