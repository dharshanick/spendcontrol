"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CalendarClock, ListChecks, Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { format, isPast, parseISO } from "date-fns";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  date: string; // Creation date
  reminderDate?: string; // NEW: Due date for alert
  alerted?: boolean; // NEW: To prevent spamming the alert
  priority: "low" | "medium" | "high";
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [reminderTime, setReminderTime] = useState(""); // State for the date picker
  const [mounted, setMounted] = useState(false);

  // 1. Load Data & Request Notification Permission
  useEffect(() => {
    const saved = localStorage.getItem("spendcontrol_todos");
    if (saved) {
      try { setTodos(JSON.parse(saved)); } catch (e) { console.error("Failed to load todos"); }
    }
    
    // Request permission for browser notifications
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    setMounted(true);
  }, []);

  // 2. Save Data
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("spendcontrol_todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  // 3. BACKGROUND TIMER: Check for alerts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const vibrateEnabled = localStorage.getItem("spendcontrol_vibration") === "true";

        setTodos(currentTodos => 
            currentTodos.map(todo => {
                // If it has a reminder, hasn't been alerted, and time is passed/now
                if (todo.reminderDate && !todo.alerted && !todo.completed) {
                    const due = new Date(todo.reminderDate);
                    
                    // Check if due time is reached (within last minute or passed)
                    if (due <= now) {
                        // TRIGGER ALERT
                        if (Notification.permission === "granted") {
                            new Notification("Task Reminder", { body: todo.text, icon: "/icon-192x192.png" });
                        } else {
                            // Fallback if notifications blocked
                            alert(`REMINDER: ${todo.text}`);
                        }

                        // TRIGGER VIBRATION (Android only)
                        if (vibrateEnabled && navigator.vibrate) {
                            navigator.vibrate([200, 100, 200]); // Vibrate-Pause-Vibrate
                        }

                        // Mark as alerted so it doesn't fire again
                        return { ...todo, alerted: true };
                    }
                }
                return todo;
            })
        );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;

    const task: Todo = {
      id: uuidv4(),
      text: newTodo,
      completed: false,
      date: new Date().toISOString(),
      reminderDate: reminderTime || undefined, // Save the time if selected
      alerted: false,
      priority: "medium",
    };

    setTodos([task, ...todos]);
    setNewTodo("");
    setReminderTime(""); // Reset picker
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddTodo();
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ListChecks className="h-8 w-8 text-primary" /> To-Do List
            </h2>
            <p className="text-muted-foreground mt-1">Don't forget to pay the bills.</p>
        </div>
        
        <Card className="w-full md:w-64 bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-muted-foreground">Completed</div>
                    <div className="text-2xl font-bold text-primary">{completedCount} / {totalCount}</div>
                </div>
                <div className="h-12 w-12 rounded-full border-4 border-primary/30 flex items-center justify-center text-xs font-bold relative">
                    {progress}%
                </div>
            </CardContent>
        </Card>
      </div>

      {/* INPUT AREA */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
            {/* Text Input */}
            <div className="flex gap-2">
                <Input 
                    placeholder="Add a new task..." 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg py-6"
                />
                <Button onClick={handleAddTodo} size="lg" className="h-auto px-6">
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
            
            {/* Reminder Date Picker */}
            <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <Input 
                    type="datetime-local" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full md:w-auto"
                />
                <span className="text-xs text-muted-foreground hidden md:inline">
                    (Optional: Set reminder)
                </span>
            </div>
        </CardContent>
      </Card>

      {/* TASK LIST */}
      <div className="space-y-3">
        {todos.length === 0 && (
            <div className="text-center py-12 opacity-50 border-2 border-dashed rounded-xl">
                <CalendarClock className="h-12 w-12 mx-auto mb-3" />
                <p>No tasks yet. Set a reminder above!</p>
            </div>
        )}

        {todos.map((todo) => {
            const hasReminder = !!todo.reminderDate;
            const isOverdue = hasReminder && !todo.completed && isPast(parseISO(todo.reminderDate!));
            
            return (
            <div 
                key={todo.id}
                className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl border bg-card transition-all hover:shadow-md",
                    todo.completed && "opacity-60 bg-muted/50",
                    isOverdue && !todo.completed && "border-red-400 dark:border-red-900 bg-red-50 dark:bg-red-900/10"
                )}
            >
                <Checkbox 
                    checked={todo.completed} 
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="h-6 w-6"
                />
                
                <div className="flex-1">
                    <p className={cn(
                        "text-lg font-medium transition-all",
                        todo.completed && "line-through text-muted-foreground"
                    )}>
                        {todo.text}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                            Created: {new Date(todo.date).toLocaleDateString()}
                        </span>
                        {hasReminder && (
                            <Badge variant="outline" className={cn(
                                "text-xs flex items-center gap-1",
                                isOverdue ? "text-red-600 border-red-200" : "text-blue-600 border-blue-200"
                            )}>
                                {isOverdue ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                                {new Date(todo.reminderDate!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                            </Badge>
                        )}
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                    <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                </Button>
            </div>
        )})}
      </div>
    </div>
  );
}