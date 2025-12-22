
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parse, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Budget } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect } from "react";
import { useCurrency } from "@/hooks/use-currency";

const formSchema = z
  .object({
    name: z.string().min(1, "Budget name is required."),
    goal: z.coerce.number().min(1, "Goal amount must be greater than 0."),
    period: z.string().optional(),
    startDate: z.string().refine(val => isValid(parse(val, 'yyyy-MM-dd', new Date())), "Date must be in YYYY-MM-DD format."),
    endDate: z.string().refine(val => isValid(parse(val, 'yyyy-MM-dd', new Date())), "Date must be in YYYY-MM-DD format."),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

type AddBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddBudget: (budget: Omit<Budget, "spent" | "id">) => void;
};

export default function AddBudgetModal({
  isOpen,
  onClose,
  onAddBudget,
}: AddBudgetModalProps) {
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: 0,
      name: "",
      period: "custom",
      startDate: "",
      endDate: "",
    },
  });

  const period = form.watch("period");
  
  useEffect(() => {
    if (isOpen) {
      if (period === 'custom') {
        form.reset({
            goal: 0,
            name: "",
            period: "custom",
            startDate: "",
            endDate: "",
        });
        return;
      }
      const now = new Date();
      if (period === 'weekly') {
        form.setValue('name', 'Weekly');
        form.setValue('startDate', format(startOfWeek(now), 'yyyy-MM-dd'));
        form.setValue('endDate', format(endOfWeek(now), 'yyyy-MM-dd'));
      } else if (period === 'monthly') {
        form.setValue('name', 'Monthly');
        form.setValue('startDate', format(startOfMonth(now), 'yyyy-MM-dd'));
        form.setValue('endDate', format(endOfMonth(now), 'yyyy-MM-dd'));
      } else if (period === 'yearly') {
        form.setValue('name', 'Yearly');
        form.setValue('startDate', format(startOfYear(now), 'yyyy-MM-dd'));
        form.setValue('endDate', format(endOfYear(now), 'yyyy-MM-dd'));
      }
    }
  }, [period, form, isOpen]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddBudget({
      name: values.name,
      goal: values.goal,
      startDate: parse(values.startDate, "yyyy-MM-dd", new Date()),
      endDate: parse(values.endDate, "yyyy-MM-dd", new Date()),
    });
    toast({
      title: "Budget Set!",
      description: `Your '${values.name}' budget has been set to ${currencySymbol}${values.goal}.`,
    });
    handleClose();
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
          <DialogDescription>
            Set a new spending goal for a specific period.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue="custom">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="yearly">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vacation to Goa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="100"
                        placeholder="e.g., 5000"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                     <FormControl>
                        <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                     <FormControl>
                        <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
