
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar, FileText } from "lucide-react";
import { format, parse } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

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
import { useTransactions } from "@/hooks/use-transactions";
import { Textarea } from "../ui/textarea";
import { useEffect } from "react";
import { useCurrency } from "@/hooks/use-currency";

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  title: z.string().min(1, "Title is required."),
  date: z.string().min(1, "Date is required."),
  description: z.string().max(1500, "Description cannot exceed 300 words.").optional(),
});

interface AddIncomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();
  const { 
    addTransaction, 
    isAddIncomeModalOpen, 
    setAddIncomeModalOpen,
  } = useTransactions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      title: "Monthly Salary",
      date: "",
      description: "",
    },
  });

  // Determine visibility: props take precedence over global state
  const showModal = isOpen !== undefined ? isOpen : isAddIncomeModalOpen;

  useEffect(() => {
    if(showModal) {
        form.reset({
            amount: 0,
            title: "Monthly Salary",
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
        });
    }
  }, [showModal, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const transactionDate = parse(values.date, "yyyy-MM-dd", new Date());
    
    const newTransaction = {
      id: uuidv4(),
      type: 'income' as 'income',
      title: values.title,
      amount: values.amount,
      category: 'Salary', // Defaulting category for income
      date: transactionDate.toISOString(),
      description: values.description,
    };

    addTransaction(newTransaction);
    
    toast({
      title: `Income Added`,
      description: `${currencySymbol}${values.amount} for ${values.title} has been logged.`,
    });

    handleClose();
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setAddIncomeModalOpen(false);
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Log a new income transaction to keep your finances up to date.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
                      <Input type="number" step="100" placeholder="0.00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" {...field} />
                      </div>
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea placeholder="Add a detailed description for this income..." className="pl-9" {...field} value={field.value || ''}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button type="submit" className="hidden" />

            <DialogFooter>
                <Button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Save Income
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
