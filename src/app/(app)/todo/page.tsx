"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Trash2, Plus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    date: string;
}

export default function TodoPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("todo-storage");
        if (saved) {
            try {
                setTodos(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save to local storage whenever todos change
    useEffect(() => {
        localStorage.setItem("todo-storage", JSON.stringify(todos));
    }, [todos]);

    const handleAdd = () => {
        if (!newTodo.trim()) return;
        const task: Todo = {
            id: Date.now(),
            text: newTodo,
            completed: false,
            date: new Date().toLocaleDateString()
        };
        setTodos([task, ...todos]);
        setNewTodo("");
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Financial Tasks</h2>
                <p className="text-muted-foreground">Keep track of your bills, savings goals, and reminders.</p>
            </div>

            <Card className="border-zinc-800 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                    <CardDescription>What do you need to remember?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Input
                            placeholder="e.g., Pay Credit Card Bill"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-zinc-900 border-zinc-700"
                        />
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {todos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No pending tasks. You're all caught up!</p>
                    </div>
                )}

                {todos.map((todo) => (
                    <div
                        key={todo.id}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group",
                            todo.completed
                                ? "bg-zinc-900/30 border-zinc-800/50 opacity-60"
                                : "bg-card border-border hover:border-zinc-700"
                        )}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => toggleTodo(todo.id)} className="text-zinc-500 hover:text-green-500 transition-colors">
                                {todo.completed ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <Circle className="h-6 w-6" />
                                )}
                            </button>

                            <div className="flex flex-col">
                                <span className={cn("font-medium transition-all", todo.completed && "line-through text-muted-foreground")}>
                                    {todo.text}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" /> {todo.date}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
