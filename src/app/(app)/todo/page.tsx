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
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("todo-storage");
        if (saved) {
            try {
                setTodos(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
        // FIX: Mark data as loaded so we don't overwrite local storage with empty initial state
        setIsLoaded(true);
    }, []);

    // Save to local storage whenever todos change
    useEffect(() => {
        // FIX: Check if data has been loaded first.
        // If we don't check this, the initial empty 'todos' array would overwrite your saved data!
        if (!isLoaded) return;
        localStorage.setItem("todo-storage", JSON.stringify(todos));
    }, [todos, isLoaded]);

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
        <div className="space-y-8 pt-24 pb-24 px-4 max-w-3xl mx-auto min-h-screen">
            <div className="space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Financial Tasks</h2>
                <p className="text-lg text-muted-foreground">Keep track of your bills, savings goals, and reminders.</p>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                    <CardDescription>What do you need to remember?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="e.g., Pay Credit Card Bill"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-background border-input text-lg h-12 shadow-inner focus-visible:ring-primary/20"
                        />
                        <Button onClick={handleAdd} size="lg" className="h-12 px-6 shadow-md shadow-primary/20 transition-transform active:scale-95">
                            <Plus className="h-5 w-5 mr-2" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {todos.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/20">
                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No pending tasks. You're all caught up!</p>
                    </div>
                )}

                {todos.map((todo) => (
                    <div
                        key={todo.id}
                        className={cn(
                            "flex items-center justify-between p-5 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                            todo.completed
                                ? "bg-muted/30 border-transparent opacity-60"
                                : "bg-card border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                        )}
                    >
                        {/* Status Indicator Bar */}
                        {!todo.completed && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/0 group-hover:bg-primary transition-colors duration-300" />
                        )}

                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => toggleTodo(todo.id)} className={cn("transition-colors duration-300", todo.completed ? "text-primary/50" : "text-muted-foreground hover:text-primary")}>
                                {todo.completed ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                ) : (
                                    <Circle className="h-6 w-6" />
                                )}
                            </button>

                            <div className="flex flex-col gap-0.5">
                                <span className={cn("font-medium text-base transition-all duration-300", todo.completed && "line-through text-muted-foreground")}>
                                    {todo.text}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <CalendarDays className="h-3 w-3" /> {todo.date}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
