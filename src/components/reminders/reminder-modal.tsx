
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useReminder } from "@/hooks/use-reminder";
import { useTodos } from "@/hooks/use-todos";
import { format, parseISO } from "date-fns";
import { BellRing, Check } from "lucide-react";

export default function ReminderModal() {
  const { dueTodo, setDueTodo, snoozeTodo } = useReminder();
  const { toggleTodo } = useTodos();

  const handleMarkAsComplete = () => {
    if (dueTodo) {
      toggleTodo(dueTodo.id);
      setDueTodo(null);
    }
  };

  const handleSnooze = () => {
    if (dueTodo) {
      snoozeTodo(dueTodo.id);
      setDueTodo(null);
    }
  };

  const handleClose = () => {
    setDueTodo(null);
  };

  if (!dueTodo) return null;

  return (
    <AlertDialog open={!!dueTodo} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
             <BellRing className="h-8 w-8 text-primary animate-pulse" />
            <AlertDialogTitle>Reminder!</AlertDialogTitle>
          </div>
          <div className="pt-2 text-sm text-muted-foreground">
            <p>It's time for your task:</p>
             <div className="font-bold text-lg text-foreground mt-2">{dueTodo.text}</div>
             <div className="text-sm text-muted-foreground">{format(parseISO(dueTodo.dueDate), "PPP 'at' p")}</div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleSnooze}>
            Snooze (5 min)
          </Button>
          <Button onClick={handleMarkAsComplete}>
            <Check className="mr-2" /> Mark as Complete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
